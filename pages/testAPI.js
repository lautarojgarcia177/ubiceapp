export default function TestAPI() {
    function testAPI() {
      fetch("/api/hello").then(res => res.json().then(console.log));
    }
    return (
      <>
        <button onClick={testAPI}>test API</button>
      </>
    );
  }
  