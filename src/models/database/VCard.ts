import mongoose from 'mongoose';

const vCardSchema = new mongoose.Schema({
  uid: String,
  content: String,
});

const VCard = mongoose.model('VCard', vCardSchema);

export default VCard;
