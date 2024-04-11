class ResizeObserverMock {
    observe() {
      // Do nothing
    }
    disconnect() {
      // Do nothing
    }
  }

global.ResizeObserver = ResizeObserverMock;