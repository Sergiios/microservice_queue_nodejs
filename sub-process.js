function runBigProcess() {
  for (let i = 0; i < 10000000; i++) {
    console.log(i);
    //process.stdout.write(String(i)); mais rapido
  }
}

runBigProcess();
