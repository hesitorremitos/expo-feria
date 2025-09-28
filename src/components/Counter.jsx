import { useState } from "react";

const Counter = () => {
	const [count, setCount] = useState(0);

	return (
		<div className="p-6 bg-white shadow-xl shadow-gray-500/20 rounded-lg space-y-4 hover:shadow-2xl transition-shadow duration-300">
			<p className="text-lg font-medium text-gray-700">Count: {count}</p>
			<button className="bg-primary-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:bg-primary-600 active:bg-primary-700 transition-all duration-200" onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
};

export default Counter;
