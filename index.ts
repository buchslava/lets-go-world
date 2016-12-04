import { HumansReader } from './humans-reader';

const humansReader = new HumansReader('./config.json');

humansReader.read((error, humans) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(humans);
});
