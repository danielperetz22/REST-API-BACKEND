import initApp from './server';

const port = process.env.PORT || 443; 
import https from "https"
import fs from "fs"
import path from 'path';
const startServer = async () => {
  try {
    const app = await initApp();

    if(process.env.NODE_ENV != "production"){
    app.listen(port, () => {
      console.log(`Server is running on https://node24.cs.colman.ac.il/:${port}`);
    });
  } else{
      const prop = {
        key: fs.readFileSync("/home/st111/client-key.pem"),
        cert: fs.readFileSync("/home/st111/client-cert.pem")
        
      };
      
    https.createServer(prop,app).listen(port);
    console.log(`HTTPS Server is running on https://node24.cs.colman.ac.il/:${port}`);
  }
 } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
