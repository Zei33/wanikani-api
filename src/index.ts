import WaniKaniAPI from "./classes/WaniKaniAPI.js";

(async () => {	
	try {
		const api = new WaniKaniAPI();

		// Get user information
		const { data: userData } = await api.user.get();
		console.log("User:", userData);

		// Get all assignments
		const { data: assignmentList } = await api.assignments.getAll();
		console.log("Total assignments:", assignmentList.length);

		// Get a specific assignment if any exist
		if (assignmentList.length > 0) {
			const [{ id }] = assignmentList;
			if (typeof id === 'number') {
				const assignment = await api.assignments.get(id);
				console.log("First assignment:", assignment);
			}
		}
	} catch (error: unknown) {
		console.error(error);
		process.exit(1);
	}
})().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});

export default WaniKaniAPI;
