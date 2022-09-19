class Tracker {
    constructor() {
        window.buffer = JSON.parse(localStorage.getItem("buffer")) || [];
        window.block = false;
    }

    track(event, ...tags) {
        const date = new Date();
        const offset = date.getTimezoneOffset() * 60000;
        const isoDateTime = new Date(date.getTime() - offset).toISOString();

        const eventTrack = {
            "event": event,
            "tags": tags,
            "url": document.URL,
            "title": document.title,
            "ts": isoDateTime
        };

        window.buffer.push(eventTrack);
        localStorage.setItem("buffer", JSON.stringify(window.buffer));

        if (!window.block && window.buffer.length > 0) {
            window.block = true;

            this.send();
        }

        if (window.buffer.length >= 3) {
            window.block = true;

            this.send();
        }
    }

    send() {
        const xhr = new XMLHttpRequest();
    
        xhr.open('POST', 'http://localhost:8001/tracker', false);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
        try {
            xhr.send(localStorage.getItem("buffer"));
    
            if (xhr.status == 200) {
                window.buffer = [];
                localStorage.setItem("buffer", JSON.stringify([]));
            }
        } catch (err) {
            console.log(err);
        }
        
        window.setTimeout(() => {window.block = false}, 10000);
    }
}

const tracker = new Tracker;

// Насколько понимаю, последние современные браузеры игнорируют такое
// Максимум предупреждение на странице
addEventListener('beforeunload', () => { 
    if (window.buffer > 0) {
        tracker.send();
    }
});
