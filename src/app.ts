import express, { urlencoded } from 'express';
import { globalErrorHandler } from "@/response_handler/error_handlers";

const app = express();
const port = process.env.PORT || 3000;

app.use(globalErrorHandler)
app.use(express.json());
// app.use(cors());
app.use(urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Bob is here to help you stay organised!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

