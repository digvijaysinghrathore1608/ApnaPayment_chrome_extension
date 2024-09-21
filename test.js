const googleMapDataDataScrollingFunc = async (pincode) => {
    // console.log('hello world do');

    var container = document.querySelector("[role='main'] > div > div");

    var lastPosition = container.scrollTop;
    var up = false;
    var sameLengthCounter = 0; // Counter to track consecutive occurrences of the same data length
    var prevDataLength = 0; // Previous data length

    var scrollInterval = setInterval(function () {
        var position = container.scrollTop;
        var height = container.scrollHeight;

        if (position === lastPosition) {
            up = !up;
        }
        lastPosition = position;

        if (up) {
            container.scrollTop += 100;
        } else {
            container.scrollTop += 100;
        }

        // Check if new data has been loaded
        var newData = container.querySelectorAll('div');
        var newDataLength = newData.length;
        console.log(newDataLength);

        if (newDataLength === prevDataLength) {
            sameLengthCounter++;
            if (sameLengthCounter >= 20) {
                clearInterval(scrollInterval);
                console.log('No more data to load');
                const fontBodyMedium = document.querySelectorAll('div.fontBodyMedium');
                const arrayData = [];
                for (let i = 0; i < fontBodyMedium.length; i++) {
                    const str = fontBodyMedium[i].innerText;
                    // console.log(str);

                    const phoneRegex = /\b\d{4,5}\s?\d{3}\s?\d{4,5}\b|\b\d{4,5}\s?\d{2}\s?\d{5}\b/g;
                    const isMatch = phoneRegex.test(str) && str.length >= 10;
                    console.log(str);
                    if (isMatch) {
                        const phoneNumber = str.match(phoneRegex)[0];
                        const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, '');
                        const first50Characters = str.substring(0, 10);
                        const siteName = 'Google Map';
                        const keyWord = pincode;
                        const currentDate = new Date();
                        const createdAt = currentDate.toISOString();
                        const data = {
                            phoneNumber: cleanedPhoneNumber,
                            name: first50Characters,
                            siteName: siteName,
                            keyWord: keyWord,
                            createAt: createdAt,
                            updateAt: createdAt,
                        }
                        arrayData.push(data);
                    } else {
                        continue;
                    }
                }

                const xhr = new XMLHttpRequest();
                const data = JSON.stringify({ arrayData });
                const apiUrl = 'https://4081-183-83-55-253.ngrok-free.app/api/sites-data-scrap-add';
                xhr.open('POST', apiUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        console.log('Request successful:', xhr.responseText);
                    } else {
                        console.error('Request failed:', xhr.status);
                    }
                };
                xhr.onerror = function () {
                    console.error('Network error occurred');
                };
                xhr.send(data);
                console.log(arrayData);
            }
        } else {
            sameLengthCounter = 0;
        }

        prevDataLength = newDataLength;
    }, 500);


    console.log('complete');
}