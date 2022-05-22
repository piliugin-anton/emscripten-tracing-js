const bench = require("nanobench");

const genString = (length = 128) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const loops = 100000;

bench("indexOf", (b) => {
  b.start();

  for (let i = 0; i < loops; i++) {
    const string = genString();
    const index = string.indexOf('a');
  }

  b.end();
});

bench("includes", (b) => {
  b.start();

  for (let i = 0; i < loops; i++) {
    const string = genString();
    const index = string.includes('a');
  }

  b.end();
});

bench("regex", (b) => {
    b.start();
  
    for (let i = 0; i < loops; i++) {
      const string = genString();
      const index = /a/i.test(string);
    }
  
    b.end();
  });