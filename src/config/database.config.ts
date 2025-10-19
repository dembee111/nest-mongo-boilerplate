import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri:
    process.env.MONGODB_URI ||
    'mongodb+srv://dembee111:Gegee108*@cluster0.8j9q6ui.mongodb.net/tasker?retryWrites=true&w=majority',
  dbname: process.env.DB_NAME || 'tasker',
}));
