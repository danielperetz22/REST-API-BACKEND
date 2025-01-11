import initApp from './server';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT; 

const startServer = async () => {
  try {
    const app = await initApp();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
