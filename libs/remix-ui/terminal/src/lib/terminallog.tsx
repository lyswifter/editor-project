import React, { useEffect, useState } from 'react' // eslint-disable-line
import axios from 'axios'

const TerminalLogMessage = () => {
    const logOutUrl = "https://chaincloud.skyipfs.com:9091/public/logs"

    let alreadyArr = []
    let sameResultObj = null
    let sameResultNumber = 0
    let fulllog = ''
    let failnum = 0
    
    const [deployLog, setdeployLog] = useState('')

    const logPoll = window.setInterval(() => {
        console.log("seek for logs")

        if (failnum == 50) {
            clearInterval(logPoll)
            return
        }

        let logfile = window.localStorage.getItem("LOGs_FILE")
        if (!logfile) {
            failnum++
            return
        }

        let reponame = window.localStorage.getItem("REPO_NAME");
        if (!reponame) {
            failnum++
            return
        }

        axios.get(logOutUrl, {
            params: {
                file: logfile,
                reponame: reponame,
            }
        })
            .then(function (response) {
                if (sameResultObj == response.data) {
                    sameResultNumber++;
                    if (sameResultNumber >= 50) {
                        clearInterval(logPoll);
                    }
                } else {
                    sameResultObj = response.data;
                }

                if (response.data.includes("Canister deploy to Internet Computer successed")) {
                    window.localStorage.removeItem('LOGs_FILE')
                    clearInterval(logPoll);
                    setdeployLog(sameResultObj)
                    return
                }

                if (response.data.includes("Encounter error while deploy")) {
                    clearInterval(logPoll);
                    return
                }

                let lines = response.data.split("\n");
                for (let i = 0; i < lines.length - 1; i++) {
                    const element = lines[i];

                    if (element == "Encounter error while deploy") {
                        continue
                    }

                    let isin = false;
                    for (let j = 0; j < alreadyArr.length; j++) {
                        const alreadyEle = alreadyArr[j];
                        if (element == alreadyEle) {
                            isin = true;
                            break;
                        }
                    }

                    if (isin) {
                        continue;
                    }

                    alreadyArr.push(element);

                    let retLog = deployLog
                    retLog += element;
                    retLog += "\n";
                    setdeployLog(retLog)
                }
            })
    }, 3000);

    return (
        <div className="remix_ui_terminal_block px-4 " data-id="block_null">Chain-Cloud IDE Compile and Deploy Logs
            <div>{deployLog}</div>
        </div>
    )
}

export default TerminalLogMessage