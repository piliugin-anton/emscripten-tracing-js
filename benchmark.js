const bench = require("nanobench");

const genString = (length = 32) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return Buffer.from(result, "utf8");
};

const decoder = new TextDecoder();

bench("toString", (b) => {
  b.start();

  for (let i = 0; i < 1000; i++) {
    const buffer = genString();
    const string = buffer.toString();
    console.log(string[0]);
  }

  b.end();
});

bench("TextDecoder", (b) => {
  b.start();

  for (let i = 0; i < 1000; i++) {
    const buffer = genString();
    const string = decoder.decode(buffer);
    console.log(string[0]);
  }

  b.end();
});
