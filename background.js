importScripts("xlsx.full.min.js");

const convertToExcelBlob = (jsonData) => {
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    return new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "GET_STATE") {
        chrome.storage.local.get("bcState", (res) => {
            sendResponse(res.bcState);
        });
        return true; // async response
    }

    if (message.type === "SET_STATE") {
        chrome.storage.local.set({ bcState: message.data }, () => {
            sendResponse(true);
        });
        return true;
    }

    if (message.type === "dataFromContentScript") {
        const payload = message.arrayData;
        const apiUrl = "https://2a5mhhh38j.execute-api.ap-south-1.amazonaws.com/api/lead-container-bulk";

        if (!payload || !payload.data || payload.data.length === 0) {
            console.log("No data received");
            return;
        }

        const excelBlob = convertToExcelBlob(payload.data);

        const fetchApiWithRetry = async () => {
            let retries = 0;
            const maxRetries = 5;

            while (retries < maxRetries) {
                try {

                    // ⚠️ हर retry में नया formData बनाओ
                    const formData = new FormData();
                    formData.append("file", excelBlob, `bc_data_${Date.now()}.xlsx`);
                    formData.append("source_id", payload.source_id);

                    const response = await fetch(apiUrl, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "X-Category-Name": "kotak 811"
                        }
                    });

                    if (!response.ok) throw new Error("Upload failed");

                    const data = await response.json();
                    console.log("✅ Upload success:", data);
                    return;

                } catch (error) {
                    retries++;
                    console.error("❌ Upload failed:", error);

                    if (retries < maxRetries) {
                        console.log(`Retry ${retries}/${maxRetries}`);
                        await new Promise(r => setTimeout(r, 2000));
                    } else {
                        console.error("❌ Max retries reached");
                    }
                }
            }
        };
        fetchApiWithRetry();
    }
});
