import express from 'express';
import routes from './routes';
import path from 'path';
import crypto from 'crypto';

const app = express();

app.use((req, res, next) => {
  const auth = req.header('Authorization');
  
  if (!auth) {
    res.sendStatus(401);
    return;
  }

  const clientSecret = process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : 'password1';
  const clientSecretSha256 = crypto.createHmac('sha256', clientSecret).digest('hex');  

  if (clientSecretSha256 === auth) {
    next();
  } else {
    res.sendStatus(401);
    return;
  }
});

app.use('/images', express.static(path.join('./images')));

routes(app);

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
