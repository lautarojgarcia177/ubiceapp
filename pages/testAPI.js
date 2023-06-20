export default function TestAPI() {
  function testAPI() {
    fetch(process.env.NEXT_PUBLIC_BACKEND_ADDRESS + "/ping").then((res) =>
      res.text().then(console.log)
    );
  }
  return (
    <>
      <button onClick={testAPI}>test API</button>
    </>
  );
}
