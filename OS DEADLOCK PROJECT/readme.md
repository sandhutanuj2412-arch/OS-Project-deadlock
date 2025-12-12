# 🔒 Automated Deadlock Detection Tool

A modern, browser-based deadlock detection simulator that visualizes and detects deadlocks in operating systems using the **Wait-For Graph (WFG)** algorithm with DFS cycle detection.

## ✨ Key Features

### 🎯 Core Functionality
- **Entity Management**: Create and manage processes and resources
- **Relationship Definition**: Define hold and wait relationships between processes and resources
- **Automated Detection**: One-click deadlock detection using DFS cycle detection algorithm
- **Visual Graph**: Interactive SVG visualization with real-time updates
- **Cycle Highlighting**: Automatically highlights deadlock cycles in red

### 🎨 User Experience
- **Modern UI**: Glassmorphism design with smooth animations
- **Toast Notifications**: Color-coded notifications for all actions
- **Keyboard Navigation**: Full keyboard support (Enter to add entities)
- **Sample Scenarios**: Pre-built deadlock and no-deadlock examples
- **Data Export**: Download detailed JSON reports

### 🔧 Technical Features
- **Wait-For Graph Algorithm**: Constructs WFG automatically
- **DFS Cycle Detection**: Efficient O(V+E) cycle detection
- **Real-time Updates**: Graph updates instantly on changes
- **Edge Case Handling**: Comprehensive validation and error handling
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📋 Complete Features List

For a detailed breakdown of all 58+ features, see **[FEATURES.md](FEATURES.md)**

## 🚀 Quick Start

1. **Open the Application**
   ```bash
   # Simply open os.html in any modern browser
   open os.html
   ```

2. **Create Entities**
   - Add processes (e.g., P1, P2)
   - Add resources (e.g., R1, R2)

3. **Define Relationships**
   - Set hold relationships (which process holds which resource)
   - Set wait relationships (which process waits for which resource)

4. **Detect Deadlock**
   - Click "Detect Deadlock" button
   - View results and highlighted cycles

5. **Try Samples**
   - Click "Simple Deadlock" for a classic deadlock example
   - Click "No Deadlock" for a safe system example

## 📁 Project Structure

```
OS DEADLOCK PROJECT/
├── os.html          # Main HTML file
├── styles.css       # All CSS styles and animations
├── script.js        # JavaScript logic and algorithms
├── readme.md        # This file
└── FEATURES.md      # Complete features documentation
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with animations and glassmorphism
- **JavaScript (ES6+)**: Deadlock detection algorithms and interactivity
- **SVG**: Vector graphics for graph visualization
- **Google Fonts**: Poppins and JetBrains Mono typography

## 🎓 How It Works

### Deadlock Detection Algorithm

1. **Wait-For Graph Construction**
   - Nodes = Processes
   - Edges = Wait relationships (P_a → P_b if P_a waits for resource held by P_b)

2. **Cycle Detection**
   - Uses Depth-First Search (DFS) algorithm
   - Detects cycles in the directed graph
   - Returns cycle path if found

3. **Visualization**
   - Processes shown as circles (left column)
   - Resources shown as rectangles (right column)
   - Hold relationships: solid arrows
   - Wait relationships: dashed arrows
   - Deadlock cycles: highlighted in red

## 📊 Example Scenarios

### Simple Deadlock
- **P1** holds **R1**, waits for **R2**
- **P2** holds **R2**, waits for **R1**
- **Result**: ✅ Deadlock Detected (Cycle: P1 → P2 → P1)

### No Deadlock
- **P1** holds **R1**
- **P2** holds **R2**, waits for **R1**
- **Result**: ✅ No Deadlock (System is safe)

## 🎨 UI Features

- **Dark Theme**: Modern dark color scheme
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Glassmorphism**: Modern glass-like card effects
- **Responsive**: Adapts to different screen sizes
- **Accessible**: ARIA labels, keyboard navigation, screen reader support

## 📤 Export Feature

The tool can export a complete JSON report containing:
- Timestamp
- All processes and resources
- All relationships (holds and waits)
- Wait-For Graph structure
- Detected cycle (if any)
- Deadlock status

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

## 📝 Developer Notes

- **No Backend Required**: Runs entirely client-side
- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Modular Code**: Separated concerns (HTML/CSS/JS)
- **Clean Architecture**: Well-organized and commented code

## 📚 Educational Use

Perfect for:
- Learning deadlock concepts
- Understanding Wait-For Graph algorithm
- Visualizing process-resource relationships
- Testing different deadlock scenarios
- Teaching operating system concepts

## 🔗 Related Concepts

- **Deadlock**: Circular waiting condition
- **Wait-For Graph**: Directed graph representation
- **Cycle Detection**: Finding cycles in graphs
- **Resource Allocation**: Process-resource relationships

---

**Made with ❤️ for Operating Systems Education**

For complete feature documentation, see [FEATURES.md](FEATURES.md)

# 2025-11-30T17:12:44 - Rev 1: improved project summary
