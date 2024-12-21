chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "dataFromContentScript") {
        const arrayData = message.arrayData;
        const baseUrl = message.baseUrl;
        // console.log("Data received from content script:", arrayData);
        if (arrayData && arrayData.length !== 0) {
            const apiUrl = baseUrl;
            const requestData = JSON.stringify({ arrayData });

            const fetchApiWithRetry = async () => {
                const maxRetries = 5;
                let retries = 0;
                while (retries < maxRetries) {
                    try {
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: requestData,
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const data = await response.json();
                        // console.log('Request successful:', data);
                        // Handle the response data here
                        return;
                    } catch (error) {
                        console.error('Request failed:', error);
                        retries++;
                        // Retry the API call after a delay
                        if (retries < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            console.log(`Retrying API call, attempt ${retries + 1} of ${maxRetries}...`);
                        } else {
                            console.error('Max retries reached, giving up.');
                        }
                    }
                }
            };

            fetchApiWithRetry();
        } else {
            console.log('arrayData is empty or undefined.');
        }
    }
});
