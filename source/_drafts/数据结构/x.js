function fbi(number) {
  if (number < 2) {
    return number === 0 ? 0 : 1;
  }

  return fbi(i - 1) + fbi(i - 2);
}
