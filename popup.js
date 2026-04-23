// url = 'https://www.bcregistry.org.in/iba/home/HomeAction.do?doBCPortal=yes'
// url = 'https://www.protean-tinpan.com/pan-center.html'
// url = 'Google map'


const extractButton1 = document.getElementById('extractButton1');
const pincodeNumber = document.getElementById('pincodeNumber');
var site_name = document.getElementById('site_name');

extractButton1.addEventListener("click", async () => {
    var site_name_value = site_name.value;
    console.log(site_name_value);
    if (site_name_value != 'Select Site') {
        if (site_name_value == 'BC Registry') {
            if (pincodeNumber !== '') {
                const myArray = pincodeNumber.value.split(", ");
                // bcRegistryDataScrapMain(myArray, 0);
                bcRegistryDataScrapMain2();
            }
        }

        if (site_name_value == 'Protean Tinpan') {
            proteanTinpanDataScrapMain()
        }

        if (site_name_value == 'Indian Institute') {
            indianInstituteDataScrapMain(pincodeNumber.value, []);
        }
        if (site_name_value == 'Whatsapp') {
            whatsappMain();
        }

        if (site_name_value == 'Google Map') {
            if (pincodeNumber !== '') {
                const myArray = pincodeNumber.value.split(", ");
                googleMapDataScrapMain();
            }
        }
        if (site_name_value == 'Mutual Funds in India') {
            mutualFundScrapMain()
        }
    } else {
        alert('select site name');
    }
});

// if site name bc registry start
const bcRegistryDataScrapMain2 = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const res = await chrome.storage.local.get("bcState");
    if (!res.bcState) {
        console.log("Initializing state...");
        await chrome.storage.local.set({
            bcState: { stateIdx: 1, distIdx: 1 }
        });
    } else {
        console.log("Resuming from:", res.bcState);
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: searchBcRegistryData2,
    }, async () => {
        await new Promise(resolve => setTimeout(resolve, 20000));
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: scrapBcRegistryData,
        }, async () => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            bcRegistryDataScrapMain2();
        });
    });
}

const searchBcRegistryData2 = async () => {

    const getState = () => new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "GET_STATE" }, resolve);
    });

    const setState = (data) => new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "SET_STATE", data }, resolve);
    });

    let state = await getState();

    if (!state) {
        state = { stateIdx: 1, distIdx: 1 };
        await setState(state);
    }
    let { stateIdx, distIdx } = state;

    // alert(stateIdx + " " + distIdx);
    await new Promise(resolve => setTimeout(resolve, 500));


    const stateSelect = document.querySelector("#stateId");
    if (stateSelect.selectedIndex != stateIdx) {

        stateSelect.selectedIndex = stateIdx;

        // Website ka native function trigger karna zaroori hai
        stateSelect.dispatchEvent(new Event('change'));
        await new Promise(resolve => setTimeout(resolve, 2500));
    }

    const distSelect = document.querySelector("#districtId");
    if (distIdx < distSelect.options.length) {
        distSelect.selectedIndex = distIdx;
        distSelect.dispatchEvent(new Event('change'));
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        await setState({
            stateIdx: stateIdx + 1,
            distIdx: 1
        });

        await searchBcRegistryData2();
        return;
    }
    await setState({
        stateIdx,
        distIdx: distIdx + 1
    });

    const btnExtractButtonBC = document.createElement('button');
    btnExtractButtonBC.id = 'extractButtonBC';
    btnExtractButtonBC.textContent = 'Start Now';
    btnExtractButtonBC.setAttribute('onclick', 'getListByState();');
    document.body.appendChild(btnExtractButtonBC);
    await new Promise(resolve => setTimeout(resolve, 300));

    const goSearchBtn = document.querySelector('#extractButtonBC');
    if (goSearchBtn) {
        goSearchBtn.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        goSearchBtn.remove();
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        alert('Button not found or insufficient buttons.');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const txtCaptcha_search = document.querySelector('#txtCaptcha_search');
    if (txtCaptcha_search) {
        const cap_search = document.querySelector('#cap_search');
        if (cap_search) {
            cap_search.value = txtCaptcha_search.value;

            await new Promise(resolve => setTimeout(resolve, 300));

            const btnCaptchaVerify = document.createElement('button');
            btnCaptchaVerify.id = 'CaptchaVerify';
            btnCaptchaVerify.textContent = 'Verify';
            btnCaptchaVerify.setAttribute('onclick', 'proceedmodal();');
            document.body.appendChild(btnCaptchaVerify);

            await new Promise(resolve => setTimeout(resolve, 300));

            const captchaVerifySearchBtn = document.querySelector('#CaptchaVerify');
            if (captchaVerifySearchBtn) {
                captchaVerifySearchBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                captchaVerifySearchBtn.remove();
            } else {
                alert('Button not found or captchaVerifySearchBtn buttons.');
            }

        } else {
            alert('Button not found or cap_search.');
        }
    } else {
        alert('Button not found or txtCaptcha_search.');
    }

}

function saveConfig(config) {
    localStorage.setItem('scraper_config', JSON.stringify(config));
}

const bcRegistryDataScrapMain = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const base_url = "https://ql1b85gun1.execute-api.ap-south-1.amazonaws.com"
    const baseUrl = base_url + "/get-key/BC Registry";
    const response = await fetchApiWithRetry(baseUrl);
    if (response.success) {
        const pincode = response?.key_word;
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: searchBcRegistryData,
            args: [pincode],
        }, async () => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: scrapBcRegistryData,
                args: [pincode, base_url + "/import-data"],
            }, async () => {
                bcRegistryDataScrapMain();
            });
        });
    }
}

const searchBcRegistryData = async (pincode) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const statepincode = document.querySelector('#statepincode');
    if (statepincode) {
        statepincode.value = pincode;
    } else {
        console.log("Element with name 'statepincode' not found.");
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const btnExtractButtonBC = document.createElement('button');
    btnExtractButtonBC.id = 'extractButtonBC';
    btnExtractButtonBC.textContent = 'Start Now';
    btnExtractButtonBC.setAttribute('onclick', 'getListByPincode();');
    document.body.appendChild(btnExtractButtonBC);

    await new Promise(resolve => setTimeout(resolve, 300));

    const goSearchBtn = document.querySelector('#extractButtonBC');
    if (goSearchBtn) {
        goSearchBtn.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        goSearchBtn.remove();
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        alert('Button not found or insufficient buttons.');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    const txtCaptcha_search = document.querySelector('#txtCaptcha_search');
    if (txtCaptcha_search) {
        const cap_search = document.querySelector('#cap_search');
        if (cap_search) {
            cap_search.value = txtCaptcha_search.value;

            await new Promise(resolve => setTimeout(resolve, 300));

            const btnCaptchaVerify = document.createElement('button');
            btnCaptchaVerify.id = 'CaptchaVerify';
            btnCaptchaVerify.textContent = 'Verify';
            btnCaptchaVerify.setAttribute('onclick', 'proceedmodal();');
            document.body.appendChild(btnCaptchaVerify);

            await new Promise(resolve => setTimeout(resolve, 300));

            const captchaVerifySearchBtn = document.querySelector('#CaptchaVerify');
            if (captchaVerifySearchBtn) {
                captchaVerifySearchBtn.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                captchaVerifySearchBtn.remove();
            } else {
                alert('Button not found or captchaVerifySearchBtn buttons.');
            }

        } else {
            alert('Button not found or cap_search.');
        }
    } else {
        alert('Button not found or txtCaptcha_search.');
    }

    // const tableBody = document.querySelector('tbody');
    // console.log('body' + tableBody);
}

const scrapBcRegistryData = async () => {
    const tbody = document.querySelector('tbody');
    const result = [];
    tbody.querySelectorAll('tr').forEach(row => {
        const rowData = {};
        row.querySelectorAll('td').forEach((cell, index) => {

            switch (index) {
                // case 0:
                //     rowData['id'] = cell.textContent.trim();
                //     break;
                case 1:
                    rowData['name'] = cell.textContent.trim().replace('+ ', '');
                    break;
                case 2:
                    rowData['mobile'] = cell.textContent.trim();
                    break;
                case 3:
                    rowData['pincode'] = cell.textContent.trim();
                    break;
                case 4:
                    rowData['bank'] = cell.textContent.trim();
                    break;
                default:
                    break;
            }
        });
        result.push(rowData);
    });
    if (result.length != 0) {
        chrome.runtime.sendMessage({ type: "dataFromContentScript", arrayData: { "source_id": 1, "data": result } });
    }
}

// if site name bc registry end

// if site name protean Tinpan start

const proteanTinpanDataScrapMain = async () => {
    const base_url = "https://ql1b85gun1.execute-api.ap-south-1.amazonaws.com";
    const baseUrl = base_url + "/get-key/Protean Tinpan";
    const response = await fetchApiWithRetry(baseUrl);
    if (response.success) {
        const pincode = response?.key_word;
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: searchProteanTinpanData,
            args: [pincode],
        },
            async () => {
                await new Promise(resolve => setTimeout(resolve, 5000));
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: scrapProteanTinpanData,
                    args: [pincode, base_url + "/import-data"],
                }, async () => {
                    proteanTinpanDataScrapMain();
                });
            }
        );
    }
}

const searchProteanTinpanData = async (pincode) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const form = document.querySelectorAll('form')[1];

    const statepincode = form.querySelector('input');
    const pin_btn = form.querySelector('button');

    if (statepincode) {
        statepincode.value = pincode;
        statepincode.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.log("Input element not found.");
    }

    if (pin_btn) {
        pin_btn.click();
    } else {
        console.log("Button element not found.");
    }

    await new Promise(resolve => setTimeout(resolve, 300));
}
const scrapProteanTinpanData = async (pincode, baseUrl) => {
    // console.log(pincode);
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');

    const result = [];
    tbody.querySelectorAll('tr').forEach(row => {
        const dbObject = {};
        row.querySelectorAll('td').forEach((cell, index) => {
            switch (index) {
                case 2:
                    dbObject['location'] = cell.textContent.trim();
                    break;
                case 5:
                    dbObject['name'] = cell.textContent.trim();
                    break;
                case 7:
                    dbObject['mobile'] = cell.textContent.trim();
                    break;
                case 8:
                    dbObject['email'] = cell.textContent.trim();
                    break;
                default:
                    break;
            }
        });
        result.push({ "db": dbObject, "response": [] });
    });

    if (result.length > 0) {
        chrome.runtime.sendMessage({ type: "dataFromContentScript", arrayData: { "key_word": pincode, "site_name": "Protean Tinpan", "data": result }, baseUrl });
        // if (result.length > 3) {
        //     await new Promise(resolve => setTimeout(resolve, 120000));
        // } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // }
    }
}


const indianInstituteDataScrapMain = async (lastSearchValue = '', StatData = []) => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: searchIndianInstituteData,
        args: [lastSearchValue],
    });
}

const searchIndianInstituteData = async (lastSearchValue) => {
    const main_state = document.querySelector('#main_state');
    const main_center = document.querySelector('#main_center');
    const btnSubmit = document.querySelector('#btnSubmit');
    if (!main_state) {
        alert('main_state not found');
        return;
    }
    var optionValues = [];
    for (var i = 0; i < main_state.options.length; i++) {
        if (i == main_state.options.length - 1) {
            console.log('complete');
        } else {
            optionValues.push(main_state.options[i].value);
        }
    }
    let position = optionValues.indexOf(lastSearchValue);
    if (position < 0) {
        alert('Value not found');
        return;
    }
    for (let i = position + 1; i < optionValues.length; i++) {
        const newStateValue = optionValues[i];
        main_state.value = newStateValue;
        await new Promise(resolve => setTimeout(resolve, 300));
        main_center.value = main_center.options[1].value;
        await new Promise(resolve => setTimeout(resolve, 300));
        btnSubmit.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (let i = 1; i < main_center.options.length; i++) {
            const centerValue = main_center.options[i].value;
            main_center.value = centerValue;
            await new Promise(resolve => setTimeout(resolve, 300));
            btnSubmit.click();
            break;
        }
    }

}


const googleMapDataScrapMain = async () => {
    // let baseUrl = await fetchNodeServerUrl();
    const base_url = "https://ql1b85gun1.execute-api.ap-south-1.amazonaws.com";
    const baseUrl = base_url + "/get-key/Google Map";
    const response = await fetchApiWithRetry(baseUrl);
    if (response.success) {
        const pincode = response?.key_word;
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: googleMapDataData,
            args: [pincode],
        }, async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: googleMapDataDataScrollingFunc,
                args: [pincode, base_url + "/import-data"],
            }, async () => {
                await new Promise(resolve => setTimeout(resolve, 10000));
                googleMapDataScrapMain();
            })
        });
    } else {
        alert(`${pincodeValue.message}`);
    }
}

const fetchNodeServerUrl = async () => {
    try {
        const response = await fetch('https://wazibmart.in/aps_crm/app/public/api/gpsnodeserverbaseurl', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // console.log(response);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Request failed:', error);
        return []
    }
}

const fetchApiWithRetry = async (apiUrl) => {
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // console.log(response);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Request failed:', error);
            retries++;
            // Retry the API call after a delay
            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log(`Retrying API call, attempt ${retries + 1} of ${maxRetries}...`);
            } else {
                console.error('Max retries reached, giving up.');
                const data = {
                    success: false
                };
                return data;
            }
        }
    }
};

const googleMapDataData = async (pincode) => {
    const searchboxinput = document.querySelector('input[aria-controls="ydp1wd-haAclf"]');
    const searchboxsearchbutton = document.querySelector('button[aria-label="Search"]');
    searchboxinput.value = pincode;
    await new Promise(resolve => setTimeout(resolve, 300));
    searchboxsearchbutton.click();
    await new Promise(resolve => setTimeout(resolve, 700));
}


const googleMapDataDataScrollingFunc = async (pincode, baseUrl) => {
    // console.log('hello world do');
    const location = pincode
    var container = document.querySelector("[role='main'] > div > div");

    var lastPosition = container.scrollTop;
    var up = false;
    let running = true;
    var sameLengthCounter = 0; // Counter to track consecutive occurrences of the same data length
    var prevDataLength = 0; // Previous data length

    while (running) {
        const containerRoleMainCheck = document.querySelectorAll("[role='main'] > div");
        const containerRoleMainCheck2 = containerRoleMainCheck[0].querySelectorAll("div > div");
        // console.log(containerRoleMainCheck2.length);
        if (containerRoleMainCheck.length > 5 || containerRoleMainCheck2.length <= 6) {
            running = false;
        } else {
            var position = container.scrollTop;
            var height = container.scrollHeight;
            if (position === lastPosition) {
                up = !up;
            }
            lastPosition = position;

            if (up) {
                container.scrollTop += 400;
            } else {
                container.scrollTop += 400;
            }

            // Check if new data has been loaded
            var newData = container.querySelectorAll('div');
            var newDataLength = newData.length;
            // console.log(newDataLength);
            const fontBodyMediumP = document.querySelectorAll('p.fontBodyMedium');
            //"You've reached the end of the list."
            // console.log(fontBodyMediumP);

            if (fontBodyMediumP.length != 0 || prevDataLength == newDataLength) {
                console.log('No more data to load 1');
                let fontBodyMediumPinnerText = "";
                if (fontBodyMediumP.length != 0) {
                    fontBodyMediumPinnerText = fontBodyMediumP[0].innerText;
                }
                sameLengthCounter++;
                // console.log(sameLengthCounter);
                if (fontBodyMediumPinnerText == "You've reached the end of the list." || sameLengthCounter >= 100) {
                    running = false;
                    console.log('No more data to load');

                    const fontBodyMedium = document.querySelectorAll('div.fontBodyMedium');

                    const arrayData = [];
                    for (let i = 0; i < fontBodyMedium.length; i++) {
                        const str = fontBodyMedium[i].innerText;
                        // console.log(str);

                        const phoneRegex = /\b\d{4,5}\s?\d{3}\s?\d{4,5}\b|\b\d{4,5}\s?\d{2}\s?\d{5}\b/g;
                        const isMatch = phoneRegex.test(str) && str.length >= 10;
                        // console.log(str);
                        if (isMatch) {
                            const phoneNumber = str.match(phoneRegex)[0];
                            const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, '');
                            const first50Characters = str.substring(0, 10);
                            const siteName = 'Google Map';
                            const data = {
                                mobile: cleanedPhoneNumber,
                                name: first50Characters,
                                location: location,
                                email: "",
                            }
                            arrayData.push({ "db": data, "response": [] });
                        } else {
                            continue;
                        }
                    }

                    if (arrayData.length != 0) {
                        // console.log(arrayData);
                        chrome.runtime.sendMessage({ type: "dataFromContentScript", arrayData: { "key_word": location, "site_name": "Google Map", "data": arrayData }, baseUrl });
                    }
                }
            } else {
                sameLengthCounter = 0;
            }

            prevDataLength = newDataLength;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }
}


const whatsappMain = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: whatsappInfoGet,
    });
}

const whatsappInfoGet = () => {
    var containers = document.querySelectorAll("[role='listitem']");
    console.log(containers);
}

//

const mutualFundScrapMain = async () => {
    const base_url = "http://3.108.36.170:8080"
    const baseUrl = base_url + "/get-key/Mutual Funds in India";
    const response = await fetchApiWithRetry(baseUrl);
    if (response.success) {
        const pincode = response?.key_word;
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: mutualFundAction,
            args: [pincode],
        }, async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: mutualFundScrapData,
                args: [pincode, base_url + "/import-data"],
            }, async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                mutualFundScrapMain();
            })
        });
    }
}

const mutualFundAction = async (pincode) => {
    const pincodeSelectBox = document.querySelector('#NearestFinAdvisorsPin');
    const submitBtn = document.querySelector('#hrfGo');
    pincodeSelectBox.value = pincode;
    await new Promise(resolve => setTimeout(resolve, 300));
    submitBtn.click();
    await new Promise(resolve => setTimeout(resolve, 700));
}

const mutualFundScrapData = async (pincode, baseUrl) => {
    const check_text_includes = (text, word) => {
        if (text.toLowerCase().includes(word.toLowerCase())) {
            return true;
        } else {
            return false;
        }
    }
    const divExcel = document.getElementById('divExcel');
    const table = divExcel.querySelector('table');
    const tbody = table.querySelector('tbody');
    const result = [];
    if (tbody) {
        const headerRow = tbody.querySelector('tr');
        const headers = Array.from(headerRow.querySelectorAll('th')).map((th) => th.textContent.trim());

        const dataRows = tbody.querySelectorAll('tr:not(:first-child)');

        dataRows.forEach((row) => {
            const values = Array.from(row.querySelectorAll('td')).map((td) => td.textContent.trim());
            const rowObject = {};
            const dbObject = {};
            let mobile = "";
            headers.forEach((header, index) => {
                rowObject[header] = values[index] || '';

                if (check_text_includes(header, "name")) {
                    dbObject['name'] = values[index] || '';
                }
                if (check_text_includes(header, "Telephone")) {
                    if (mobile == "") {
                        mobile = values[index] || '';
                        dbObject['mobile'] = values[index] || '';
                    }
                }
                if (check_text_includes(header, "Email")) {
                    dbObject['email'] = values[index] || '';
                }
                if (check_text_includes(header, "Pin")) {
                    dbObject['location'] = values[index] || '';
                }
            });

            result.push({ "db": dbObject, "response": [] });
        });

        if (result.length != 0) {
            // console.log(result);
            chrome.runtime.sendMessage({ type: "dataFromContentScript", arrayData: { "key_word": pincode, "site_name": "Mutual Funds in India", "data": result }, baseUrl });
        }
    }
}
