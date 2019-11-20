const makeCall = async(url, data) => {
	const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json;
}

export default makeCall;