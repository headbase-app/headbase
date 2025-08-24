import {useState} from "react";

export function App() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Hello from React!</h1>
            <p>Count is {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    )
}