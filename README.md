# MYq-morph

A Vue 3 based mesh editor for creating and manipulating 2D meshes. This project is a modern web implementation of the original Java AWT-based qmorph mesh editor.

## Features

- Interactive mesh creation and editing
- Node and edge management
- Grid and axis display
- Zoom functionality (10%-400%)
- File import/export (.mesh and .dta formats)
- LaTeX export
- Undo/redo functionality

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Element Plus
- Konva.js
- Vue Konva
- Pinia
- File Saver

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/MYq-morph.git
cd MYq-morph
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Build for production

```bash
npm run build
# or
yarn build
```

## Usage

1. **Node Mode**: Click to create nodes, drag to move them
2. **Triangle Mode**: Create triangular mesh elements
3. **Quad Mode**: Create quadrilateral mesh elements
4. **Grid and Axes**: Toggle grid and coordinate axes visibility
5. **Zoom**: Use the slider or mouse wheel to zoom in/out
6. **File Operations**: Import/Export mesh files in .mesh or .dta format
7. **LaTeX Export**: Export the mesh as TikZ code for LaTeX documents

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
