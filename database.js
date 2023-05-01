const mongoose=require('mongoose')
const { exec } = require('child_process');
const cron = require('node-cron');


exports.connectDatabase = ()=>{
    mongoose.connect(process.env.DB_LOCAL_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(con=>{
        console.log(`mongoDB is connected to the host: ${con.connection.host}`);
    }).catch((err)=>{
        console.log(err);
    })
};mongoose.set('strictQuery', false);



exports.backupDb=()=>{
    cron.schedule('0 1 * * 6', () => {
        console.log('Starting backup');
        exec('mongodump --db skyway ', (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Backup completed'+stdout);
        });
      });
}

// exports.backupDb = ()=>{
    
//     exec(`mongodump --db skyway`, (err, stdout, stderr) => {
//         console.log('backup');
//         if (err) {
//           console.error(err);
//           return;
//         }
//         console.log(stdout);
//       });
//     }

exports.restoreDb =()=>{
    cron.schedule('0 2 * * 1', () => {
        console.log('Starting restore');
        exec('mongorestore --db skyway', (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Restore completed');
        });
      });
}

// exports.restoreDbOnce=()=>{
//     console.log('Starting restore');
//         exec('mongorestore --db skyway ', (err, stdout, stderr) => {
//           if (err) {
//             console.error(err);
//             return;
//           }
//           console.log('Restore completed');
//         });
// }