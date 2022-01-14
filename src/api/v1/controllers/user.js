const picture = (req, res) => {
  res.send({
    success: true,
    file: req.file,
  });
};

export default {
  picture,
};
