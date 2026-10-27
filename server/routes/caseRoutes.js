import express from 'express';
import Case from '../models/Case.js';
import { generateMysteryFromGemini } from '../services/geminiService.js';

const router = express.Router();

// 1. POST /api/cases — Generate a new mystery case
router.post('/', async (req, res) => {
  try {
    const { premise, difficulty } = req.body;
    if (!premise || !difficulty) {
      return res.status(400).json({ error: 'Premise and difficulty are required.' });
    }

    const generatedData = await generateMysteryFromGemini(premise, difficulty);

    const newCase = new Case({
      title: generatedData.title,
      premise,
      difficulty,
      story: generatedData.story,
      suspects: generatedData.suspects,
      clues: generatedData.clues,
      hints: generatedData.hints,
      culpritId: generatedData.culpritId,
      solutionExplanation: generatedData.solutionExplanation
    });

    await newCase.save();

    // Fetch active case without hidden sensitive fields
    const activeCase = await Case.findById(newCase._id);
    res.status(201).json(activeCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/cases/:id — Retrieve active mystery state
router.get('/:id', async (req, res) => {
  try {
    const activeCase = await Case.findById(req.params.id);
    if (!activeCase) {
      return res.status(404).json({ error: 'Case file not found.' });
    }
    res.json(activeCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /api/cases/:id/clues/:clueId/discover — Discover a clue
router.post('/:id/clues/:clueId/discover', async (req, res) => {
  try {
    const activeCase = await Case.findById(req.params.id);
    if (!activeCase) return res.status(404).json({ error: 'Case not found.' });
    if (activeCase.status === 'Completed') {
      return res.status(400).json({ error: 'Case is already closed.' });
    }

    const clue = activeCase.clues.find(c => c.clueId === req.params.clueId);
    if (!clue) return res.status(404).json({ error: 'Clue not found.' });

    if (!clue.discovered) {
      clue.discovered = true;
      clue.discoveredAt = new Date();
      await activeCase.save();
    }

    res.json({ message: 'Clue discovered', clue, clues: activeCase.clues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /api/cases/:id/hints — Request next available hint
router.post('/:id/hints', async (req, res) => {
  try {
    const activeCase = await Case.findById(req.params.id);
    if (!activeCase) return res.status(404).json({ error: 'Case not found.' });
    if (activeCase.status === 'Completed') {
      return res.status(400).json({ error: 'Case is already closed.' });
    }

    const unrevealedHint = activeCase.hints.find(h => !h.revealed);
    if (!unrevealedHint) {
      return res.status(400).json({ error: 'No further hints available.' });
    }

    unrevealedHint.revealed = true;
    await activeCase.save();

    res.json({ hint: unrevealedHint, hints: activeCase.hints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/cases/:id/accuse — Submit accusation and calculate score
router.post('/:id/accuse', async (req, res) => {
  try {
    const { suspectId } = req.body;
    if (!suspectId) return res.status(400).json({ error: 'Suspect ID required.' });

    // Explicitly select hidden fields for verification
    const activeCase = await Case.findById(req.params.id).select('+culpritId +solutionExplanation');
    if (!activeCase) return res.status(404).json({ error: 'Case not found.' });
    if (activeCase.status === 'Completed') {
      return res.status(400).json({ error: 'Accusation already submitted for this case.' });
    }

    const isCorrect = activeCase.culpritId === suspectId;

    // Base score by difficulty
    const baseScores = { Easy: 100, Medium: 150, Hard: 200 };
    let score = isCorrect ? baseScores[activeCase.difficulty] : 0;

    // Add clue points (+5 each discovered)
    const discoveredCluesCount = activeCase.clues.filter(c => c.discovered).length;
    score += discoveredCluesCount * 5;

    // Deduct hint penalties (-10 each revealed)
    const revealedHintsCount = activeCase.hints.filter(h => h.revealed).length;
    score -= revealedHintsCount * 10;

    // Enforce minimum score constraint
    if (score < 0) score = 0;

    activeCase.status = 'Completed';
    activeCase.verdict = isCorrect ? 'Guilty' : 'Solitary Failure';
    activeCase.score = score;
    activeCase.playerAccusation = {
      suspectId,
      submittedAt: new Date()
    };

    await activeCase.save();

    res.json({
      verdict: activeCase.verdict,
      isCorrect,
      score,
      culpritId: activeCase.culpritId,
      solutionExplanation: activeCase.solutionExplanation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/cases/:id/result — Retrieve completed case results
router.get('/:id/result', async (req, res) => {
  try {
    const activeCase = await Case.findById(req.params.id).select('+culpritId +solutionExplanation');
    if (!activeCase) return res.status(404).json({ error: 'Case not found.' });
    if (activeCase.status !== 'Completed') {
      return res.status(400).json({ error: 'Case is still under active investigation.' });
    }

    const culprit = activeCase.suspects.find(s => s.suspectId === activeCase.culpritId);
    const accused = activeCase.suspects.find(s => s.suspectId === activeCase.playerAccusation.suspectId);

    res.json({
      title: activeCase.title,
      difficulty: activeCase.difficulty,
      verdict: activeCase.verdict,
      score: activeCase.score,
      culprit,
      accused,
      solutionExplanation: activeCase.solutionExplanation,
      cluesDiscovered: activeCase.clues.filter(c => c.discovered).length,
      totalClues: activeCase.clues.length,
      hintsUsed: activeCase.hints.filter(h => h.revealed).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;