export default (app) => {
  app.get('/', async (req, res) => {
    res.send('Blackbox Service by Jake King');
  });
};
