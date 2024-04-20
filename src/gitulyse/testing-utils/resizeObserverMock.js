class ResizeObserverMock {
    observe() {
        // Do nothing
    }

    disconnect() {
        // Do nothing
    }

    unobserve() {
        // Do nothing
    }
}

global.ResizeObserver = ResizeObserverMock;
