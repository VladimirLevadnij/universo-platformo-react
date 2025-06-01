# Current Active Context

## Complex UPDL Structures Development

### Current Goal 🎯

Enable creation of complex UPDL structures in Chatflow that support:

-   Multiple 3D objects within single Space node
-   Multiple interconnected Space nodes in single Chatflow
-   Advanced AR.js publication/export functionality for complex scenes

### Architecture Foundation ✅

**Completed Infrastructure:**

-   **Project Structure**: Clean separation between UPDL node definitions (`apps/updl/`) and publication system (`apps/publish-frt/`, `apps/publish-srv/`)
-   **AR.js Publication**: Working streaming generation with Supabase persistence
-   **UPDL Integration**: Nodes loaded by Flowise NodesPool, processed by utilBuildUPDLflow
-   **API Routes**: Correct authentication with `/api/v1/uniks/{unikId}/chatflows/{chatflowId}`

### Current Development Focus

#### Multi-Object Spaces

**Objective**: Support multiple 3D objects in single Space node

**Current State**: Basic single-object spaces working
**Target State**: Rich scenes with multiple positioned objects

**Key Areas**:

-   Object positioning and relationship management
-   Dynamic object generation from UPDL data
-   Proper coordinate system handling

#### Connected Spaces Architecture

**Objective**: Multiple Space nodes in single Chatflow with navigation

**Current State**: Single space per chatflow
**Target State**: Multi-space experiences with transitions

**Key Areas**:

-   Space relationship and navigation logic
-   Cross-space object references
-   User experience for space transitions

#### Advanced AR.js Generation

**Objective**: Complex scene generation from multi-space UPDL

**Current State**: Simple space-to-AR.js conversion
**Target State**: Rich AR experiences with interactions

**Key Areas**:

-   Complex scene generation algorithms
-   Space transitions and interactions
-   Enhanced object behavior and properties

### UPDL Node Enhancement Strategy

#### Enhanced Space Node Capabilities

-   **Multi-object support**: Array of objects instead of single object
-   **Spatial relationships**: Positioning, grouping, hierarchies
-   **Scene properties**: Lighting, environment, background

#### Advanced Object Nodes

-   **Interaction capabilities**: Touch, proximity, animation triggers
-   **Advanced properties**: Physics, materials, textures
-   **Behavioral logic**: State management, conditional appearance

#### Navigation and Linking Nodes

-   **Portal nodes**: Transitions between spaces
-   **Trigger nodes**: Conditional navigation logic
-   **State nodes**: Persistent data across spaces

### Implementation Priorities

#### Phase 1: Multi-Object Foundation

1. **Space Node Enhancement**

    - Modify Space node to accept multiple objects
    - Implement object array handling in utilBuildUPDLflow
    - Update UPDLToARJSConverter for multi-object scenes

2. **Object Positioning System**
    - Relative positioning within space
    - Collision detection and automatic layout
    - Visual positioning tools in Flowise interface

#### Phase 2: Multi-Space Architecture

1. **Chatflow Multi-Space Support**

    - Multiple Space nodes in single Chatflow
    - Space identification and referencing system
    - Navigation logic between spaces

2. **AR.js Multi-Scene Generation**
    - Scene switching mechanisms
    - State preservation across scenes
    - User navigation interfaces

#### Phase 3: Advanced Features

1. **Interactive Objects**

    - Object interaction definitions
    - Event handling in AR.js output
    - Complex object behaviors

2. **Advanced Navigation**
    - Conditional navigation logic
    - User choice-driven experiences
    - Progress tracking and state management

### Technical Considerations

#### Performance Optimization

-   Asset preloading for multi-object scenes
-   Progressive loading for large spaces
-   Mobile device optimization

#### User Experience

-   Intuitive Chatflow interface for complex structures
-   Visual feedback for space relationships
-   Clear error handling for complex configurations

#### Architecture Scalability

-   Plugin system for new object types
-   Extensible navigation mechanisms
-   Future support for other 3D platforms

### Success Metrics

#### Functionality Goals

-   [ ] Single Space with 5+ objects positioned correctly
-   [ ] Chatflow with 3+ connected Spaces
-   [ ] Seamless navigation between Spaces in AR.js
-   [ ] Complex object interactions working

#### User Experience Goals

-   [ ] Intuitive Chatflow interface for multi-object scenes
-   [ ] Clear visual representation of Space relationships
-   [ ] Smooth AR.js experiences on mobile devices
-   [ ] Comprehensive error handling and validation

### Current Status

**Phase**: BUILD MODE - Multi-Object Spaces Implementation
**Current Step**: Step 2 - PositionManager Implementation (AR.js-specific)

**✅ Step 1 COMPLETED** (January 26, 2025):

-   **Universal UPDL Data Extraction Fix** in `packages/server/src/utils/buildUPDLflow.ts`
-   Fixed field mappings: `inputs.type` → `inputs.objectType`, position/scale extraction
-   Color format standardized, Number() conversions added
-   Verified with successful `pnpm run build`
-   **Architecture Maintained**: Universal vs AR.js-specific logic separation

**🔄 Step 2 IN PROGRESS**:

-   **Target**: PositionManager implementation in `apps/publish-frt/builders/arjs/ObjectHandler.ts`
-   **Goal**: Circular layout algorithm with adaptive radius
-   **Features**: Respects manual positions, automatic object separation

**⏳ Step 3 PLANNED**: MultiObjectValidator implementation (Custom validation classes)
**⏳ Step 4 PLANNED**: Performance optimization (Caching + object batching)

**Next Immediate Actions**:

1. Implement core PositionManager class for circular object arrangement
2. Add adaptive radius calculation based on object count
3. Integrate positioning logic with existing ARJSBuilder system
4. Test with 3-5 objects to verify no overlapping

**Creative Phase Decisions Applied**:

-   ✅ Circular layout algorithm chosen for automatic positioning
-   ✅ Architectural separation: universal extraction vs AR.js-specific processing
-   ✅ Custom validation approach designed for Steps 3-4

This represents current progress in evolving from basic single-object AR.js publication to sophisticated multi-object 3D experience creation platform.
