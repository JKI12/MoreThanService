import { getData } from './service/moreThan';

export default (app) => {
  app.get('/api/scores', async (req, res) => {
    const data = await getData();
    res.send(data);
  });
};
