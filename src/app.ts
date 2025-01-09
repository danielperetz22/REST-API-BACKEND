import initApp from './server';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT; // Default to port 3000 if not provided

const startServer = async () => {
  try {
    const app = await initApp(); // Initialize the app
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit the process with failure code
  }
};

startServer();
