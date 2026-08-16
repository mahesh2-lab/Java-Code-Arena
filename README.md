<p align="center">
  <a href="https://github.com/mahesh2-lab/jyvra">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=3000&pause=1000&color=FF2D20&center=true&vCenter=true&multiline=true&repeat=true&width=750&height=120&lines=%E2%9B%A7+INITIALIZING+JVM+SUMMONING+PROTOCOL+%E2%9B%A7;%E2%98%95+Jyvra+%E2%80%94+The+Arena+Awakens+%E2%98%95;%E2%9A%A1+Compile.+Execute.+Conquer.+%E2%9A%A1" alt="Jyvra Boot Sequence" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JVM-ONLINE-brightgreen?style=for-the-badge&logo=openjdk&logoColor=white&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/ARENA-ACTIVE-ff2d20?style=for-the-badge&logo=fire&logoColor=white&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/BYTECODE-READY-blueviolet?style=for-the-badge&logo=bytedance&logoColor=white&labelColor=0a0a0a" />
  <img src="https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge&logo=opensourceinitiative&logoColor=white&labelColor=0a0a0a" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

# ⛧ Jyvra ⚡ — *Where Code Enters. Bytecode Leaves.* ☕

> *"In the beginning, there was `javac`. And `javac` said: let there be `.class` files. And there were `.class` files. And the JVM looked upon them, and saw that they were good."*
> — The Book of Compilation, Chapter 1

**Jyvra** is a browser-based online Java compiler and execution arena — a full-stack ritual chamber where mortals write Java, and the server compiles and runs it in real time. Monaco Editor on the frontend. Flask on the backend. The JVM in the shadows, waiting.

---

## ⛧ The Boot Sequence

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  ██╗ █████╗ ██╗   ██╗ █████╗ ██████╗ ███████╗███╗   ██╗ █████╗   ║
║  ██║██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗  ║
║  ██║███████║██║   ██║███████║██████╔╝█████╗  ██╔██╗ ██║███████║  ║ 
║  ██║██╔══██║╚██╗ ██╔╝██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║  ║
║  ██║██║  ██║ ╚████╔╝ ██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║  ║
║  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

[BOOT] Jyvra v1.0 — Summoning Protocol Initiated
[    ] Detecting host OS .................... ✓ Linux
[    ] Locating javac binary ................ ✓ /usr/bin/javac
[    ] Verifying JVM heartbeat .............. ✓ OpenJDK 17.0.2
[    ] Raising Flask server from the void ... ✓ Port 5000
[    ] Mounting Monaco Editor grimoire ...... ✓ React 18.3
[    ] Binding frontend to backend .......... ✓ Vite proxy locked
[    ] Warming the classloader .............. ✓ Ready

[SYSTEM] The Arena is open.
[SYSTEM] May your semicolons be plentiful, and your NullPointers few.

>>> Listening on http://localhost:5000
```

---

## ⚡ Invocation

*The ritual has two paths. Choose your summoning method.*

<details>
<summary><b>🔮 Path I — The Automated Rite (Recommended)</b></summary>

**On Linux / macOS:**
```bash
chmod +x start.sh
./start.sh
```

**On Windows:**
```
start.bat
```

The script will install all dependencies, build the frontend, and raise the server automatically. Open `http://localhost:5000` when the incantation completes.

</details>

<details>
<summary><b>📜 Path II — The Manual Ritual (For Those Who Seek Control)</b></summary>

### Prerequisites — *Gather Your Artifacts*

| Artifact | Minimum | Recommended |
|----------|---------|-------------|
| **JDK** | Any | OpenJDK 17+ |
| **Node.js** | 16+ | 18+ |
| **Python** | 3.7+ | 3.13+ |
| **npm** | Bundled with Node | Latest |

### Step 1 — Install the Dependencies
```bash
npm install
pip install -r requirements.txt
```

### Step 2 — Forge the Frontend
```bash
npm run build
```

### Step 3 — Raise the Server
```bash
python server.py
```

You should witness:
```
Java Compiler Server - Detected OS: Linux
✓ Java compiler found and ready
Starting unified server on http://localhost:5000
Serving React frontend + Java Compiler API
```

### Step 4 — Enter the Arena
Open [http://localhost:5000](http://localhost:5000) in your browser.

</details>

<details>
<summary><b>🐳 Path III — The Docker Containment (For the Disciplined)</b></summary>

```bash
docker-compose up --build
```

One command. One container. One arena. Port `5000`. Done.

</details>

<details>
<summary><b>⚙️ Development Mode (Live Reload)</b></summary>

If you wish to modify the arena while it runs:

```bash
# Terminal 1 — The Frontend Watcher
npm run dev

# Terminal 2 — The Backend Daemon
python server.py
```

The frontend will hot-reload. The backend will persist. Chaos under control.

</details>

---

## ☕ Features of the Abyss

| Feature | Description |
|---------|-------------|
| **Monaco Editor** | The same editor that powers VS Code — syntax highlighting, autocomplete, the works |
| **Real-Time Compilation** | Write Java → hit Run → see output. No pages to refresh. No files to save. |
| **Server-Side Execution** | Your code compiles and runs on the actual JVM. Not an emulator. Not a sandbox. The real thing. |
| **Cross-Platform** | Windows, Linux, macOS — the arena doesn't discriminate |
| **Split-Pane Layout** | Resizable editor and output panels. Because one screen is all you need. |
| **10s Execution Timeout** | Infinite loops are detected and terminated. The arena has rules. |
| **Docker Support** | One `docker-compose up` to rule them all |
| **Client-side Java execution** | via WebAssembly when the server is unreachable |

---

## 🏛️ Architecture of the Ritual

```
                    ┌─────────────────────────────────┐
                    │         THE MORTAL (You)        │
                    │      Writes Java in browser     │
                    └──────────────┬──────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │       MONACO EDITOR (React)     │
                    │   TypeScript · Tailwind · Vite  │
                    │     Syntax highlighting, etc.   │
                    └──────────────┬──────────────────┘
                                   │  POST /api/compile
                                   ▼
                    ┌─────────────────────────────────┐
                    │       FLASK SERVER (Python)     │
                    │    Receives code via REST API   │
                    │    Writes temp .java file       │
                    └──────────────┬──────────────────┘
                                   │  javac + java
                                   ▼
                    ┌─────────────────────────────────┐
                    │        JVM (The Beast)          │
                    │   Compiles → Executes → Returns │
                    │   stdout / stderr / exit code   │
                    └──────────────┬──────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────┐
                    │         OUTPUT PANEL            │
                    │  Real-time results in browser   │
                    └─────────────────────────────────┘
```

### File Structure — *The Sacred Geometry*

```
JavaRena/
├── src/                    # React + TypeScript source (the frontend grimoire)
│   ├── components/         # UI components (shadcn/ui + Radix)
│   ├── pages/              # Application pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── App.tsx             # The root incantation
├── server.py               # Flask backend (the summoner)
├── dist/                   # Built frontend (generated by npm run build)
├── public/                 # Static assets
├── Dockerfile              # Docker containment spell
├── docker-compose.yml      # Orchestration ritual
├── start.bat               # Windows startup script
├── start.sh                # Linux/Mac startup script
├── requirements.txt        # Python dependencies
├── package.json            # Node dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

---

## 📡 API Endpoints — *The Protocols*

<details>
<summary><b>GET /api/health — Check the Server Pulse</b></summary>

```bash
curl http://localhost:5000/api/health
```

</details>

<details>
<summary><b>POST /api/compile — Submit Code to the Arena</b></summary>

```bash
curl -X POST http://localhost:5000/api/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"public class Main { public static void main(String[] args) { System.out.println(\"Hello from the Arena!\"); } }"}'
```

</details>

<details>
<summary><b>GET /api/info — Server Intelligence Report</b></summary>

```bash
curl http://localhost:5000/api/info
```

</details>

---

## 📖 The First Ritual — *A Java Offering*

Paste this into the editor and hit **Run**. If the output appears, the JVM has accepted your offering.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("╔═══════════════════════════════════╗");
        System.out.println("║   The Arena acknowledges you.     ║");
        System.out.println("║   Your code compiled.             ║");
        System.out.println("║   The JVM has spoken.             ║");
        System.out.println("╚═══════════════════════════════════╝");

        String[] truths = {
            "Semicolons are not optional.",
            "Everything is an object. Except primitives.",
            "Checked exceptions build character.",
            "The garbage collector giveth, and it taketh away."
        };

        System.out.println("\n--- Truths of the JVM ---");
        for (int i = 0; i < truths.length; i++) {
            System.out.println((i + 1) + ". " + truths[i]);
        }

        System.out.println("\nTotal truths revealed: " + truths.length);
    }
}
```

---

## ⚔️ Rules of the Realm

1. **Your class must be named `Main`** — The arena expects `public class Main` with a `public static void main(String[] args)` entry point.
2. **10-second execution limit** — Infinite loops will be slain. The arena does not wait.
3. **Standard I/O only** — `System.out` and `System.err` are your voice. GUI and file I/O are beyond the arena's walls.
4. **One file, one class** — This is a compiler, not an IDE. Keep it focused.
5. **No external dependencies** — The JVM standard library is your toolkit. No Maven. No Gradle. Just raw Java.

---

## 🔮 Future Rituals

- [ ] **Multi-file support** — Summon multiple classes into the arena
- [ ] **Stdin support** — Let users feed input to running programs
- [ ] **Syntax error highlighting** — Mark the lines where the JVM weeps
- [ ] **Code sharing** — Shareable links for arena submissions
- [ ] **Multiple languages** — Python, C++, and other mortals may enter
- [ ] **User accounts** — Save your rituals for future sessions
- [ ] **Dark/light theme toggle** — Choose your allegiance

---

## 🩸 Who Should Enter

| You Are | Verdict |
|---------|---------|
| A student learning Java | **Enter.** This was built for you. |
| A developer testing a quick snippet | **Enter.** No IDE boot time. No project setup. |
| Someone who wants to run Java in a browser | **Enter.** That's literally what this does. |
| A recruiter asking candidates to live-code | **Enter.** Share the link. Watch them type. |
| Someone who thinks JavaScript is Java | **Turn back.** This is not your realm. |

---

## 🛠️ Troubleshooting — *When the Ritual Fails*

<details>
<summary><b>"Java compiler not found"</b></summary>

Install the **JDK** (not just JRE). Then restart your terminal.

```bash
# Ubuntu/Debian
sudo apt-get install openjdk-17-jdk

# macOS
brew install openjdk

# Windows → download from https://openjdk.org/install/
```

</details>

<details>
<summary><b>"Frontend not built yet"</b></summary>

```bash
npm run build
python server.py
```

</details>

<details>
<summary><b>Port 5000 already in use</b></summary>

Edit `server.py` and change the port number:
```python
app.run(debug=False, host="0.0.0.0", port=5001)  # Changed from 5000
```

</details>

<details>
<summary><b>Python module not found</b></summary>

```bash
pip install -r requirements.txt
```

</details>

---

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=14&duration=4000&pause=2000&color=666666&center=true&vCenter=true&repeat=true&width=500&lines=The+JVM+never+sleeps.+The+Arena+never+closes.;javac+Main.java+%26%26+java+Main;System.out.println(%22Until+next+time.%22)%3B" alt="Footer" />
</p>

<p align="center">
  <sub>Built with ☕ and questionable life choices. Licensed under <a href="LICENSE">MIT</a>.</sub>
</p>
