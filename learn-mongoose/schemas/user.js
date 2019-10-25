const mongoose = require('mongoose');
 
const { Schema } = mongoose;
const userSchema = new Schema({
    // type : 자료형
    // required : 필수여부
    // unique : 고유 여부
    // default : 기본값
    name: {
        type: String,
        required: true,
        unique: true,
      },
      age: {
        type: Number,
        required: true,
      },
      married: {
        type: Boolean,
        required: true,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
});

// 이름 나이 결혼여부 자기소개 생년일

module.exports = mongoose.model('User', userSchema);