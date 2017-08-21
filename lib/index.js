import express from 'express';
import publicRoutes from './publicRoutes';
import secureRoutes from './secureRoutes';
import path from 'path';
import crypto from 'crypto';

const app = express();

publicRoutes(app);

app.use('/images', express.static(path.join('./images')));

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

secureRoutes(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
