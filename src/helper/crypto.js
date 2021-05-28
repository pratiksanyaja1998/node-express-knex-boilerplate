const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key =  process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

function encrypt(text) {
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return iv.toString('hex')+":"+encrypted.toString('hex');
}

function decrypt(text) {
    text = {
        iv: text.split(":")[0],
        encryptedData: text.split(":")[1],
    }
    // console.log(text)
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
//  console.log("decrypt ...")
//  console.log(decrypted)
 return decrypted.toString();
}


module.exports ={
    encrypt, decrypt
}

// var hw = encrypt("pratik1998")
// console.log(hw)
// console.log(decrypt('4f27aaaf3f8c3259f44ee395271a3d95:922c776d9d566842949000f6d07cd430'))