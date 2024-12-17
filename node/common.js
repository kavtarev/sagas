export async function wait(ms) {
  return new Promise(r => {
    setTimeout(() => r(), ms)
  })
}