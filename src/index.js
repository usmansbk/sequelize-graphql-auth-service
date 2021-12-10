const Asynch = async () => await Promise.resolve("Hello");

const App = async () => {
  await Asynch();
  console.log("Hello");
};

App();
