const mongoose = require('mongoose');
 
const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const commentSchema = new Schema({
    // ref가 user의 기본 키를 참조를 한다.
    // NoSQL이니까 관계는 없다. 
    commenter: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
      comment: {
        type: String,
        required: true,
    },
      createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', commentSchema);