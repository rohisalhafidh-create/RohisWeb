export default function handler(req: any, res: any) {
  res.status(200).json({ message: 'pong', env: process.env.NODE_ENV });
}
