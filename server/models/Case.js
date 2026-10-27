import mongoose from 'mongoose';

const ClueSchema = new mongoose.Schema({
  clueId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Forensic', 'Digital', 'Physical', 'Documentary', 'Witness'], required: true },
  discovered: { type: Boolean, default: false },
  discoveredAt: { type: Date }
});

const SuspectSchema = new mongoose.Schema({
  suspectId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  alibi: { type: String, required: true },
  motive: { type: String, required: true }
});

const HintSchema = new mongoose.Schema({
  hintId: { type: String, required: true },
  text: { type: String, required: true },
  revealed: { type: Boolean, default: false }
});

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  story: { type: String, required: true },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  culpritId: { type: String, required: true, select: false },
  solutionExplanation: { type: String, required: true, select: false },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
  playerAccusation: {
    suspectId: { type: String },
    submittedAt: { type: Date }
  },
  score: { type: Number, default: 0 },
  verdict: { type: String, enum: ['Pending', 'Guilty', 'Solitary Failure'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Case', CaseSchema);