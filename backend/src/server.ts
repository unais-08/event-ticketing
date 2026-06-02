import "dotenv/config";
import prisma from './config/prisma.js';
import app from "./app.js";
import { logger, serializeError } from "./config/logger.js";

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    logger.info("Starting backend service.");
  
    await prisma.$connect();

    app.listen(PORT, () => {  
      logger.info("HTTP server is ready and accepting requests.", {
        url: `http://localhost:${PORT}`,
      });
    });
  } catch (error) {
    logger.error("Database connection failed during startup.", {
      error: serializeError(error),
    });

    process.exit(1);
  }
}

void startServer();
