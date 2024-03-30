"use client";
import CodeContributions from "@components/repo/CodeContributions";
import IssueTracking from "@components/repo/IssueTracking";
import PullRequests from "@components/repo/PullRequests";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


export default function RepoPage({ params }) {
  const owner = params.owner;
  const repo = params.repo;

  const [userAccessToken, setUserAccessToken] = useState("");
  const [gridLayout, setGridLayout] = useState(Array.from({ length: 2 }).map(() => Array.from({ length: 1 }).fill(null)));


  const DraggableNavItem = ({ name }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "NAV_ITEM",
      item: { name },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "pointer",
          marginBottom: "8px",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#fff",
        }}
      >
        {name}
      </div>
    );
  };

  const DropZone = ({ onDrop, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
      accept: "NAV_ITEM",
      drop: (item) => onDrop(item),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    return (
      <div
        ref={drop}
        style={{
          width: "100%",
          minHeight: "200px",
          backgroundColor:
            isOver && canDrop ? "lightgreen" : canDrop ? "lightyellow" : "#242424",
          position: "relative",
          border: "1px dashed #ccc",
          padding: "20px",
        }}
      >
        {isOver && canDrop && (
          <p
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            Drop here
          </p>
        )}
        {children}
      </div>
    );
  };

  const GridDropZone = ({ onDrop, gridLayout }) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {gridLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((item, colIndex) => (
              <div key={colIndex} style={{ flex: 1 }}>
                <DropZone
                  onDrop={(itemName) => onDrop(itemName, rowIndex, colIndex)}
                >
                  {item && renderItem(item)}
                </DropZone>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderItem = (item) => {
    const { name } = item;
    switch (name) {
      case "Code Contributions":
        return <CodeContributions owner={owner} repo={repo} userAccessToken={userAccessToken} />;
      case "Pull Requests":
        return <PullRequests owner={owner} repo={repo} userAccessToken={userAccessToken} />;
      case "Issue Tracking":
        return <IssueTracking owner={owner} repo={repo} userAccessToken={userAccessToken} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    async function getInfo() {
      const info = await getSession();
      if (info) {
        setUserAccessToken(info.accessToken);
      }
    }

    getInfo().catch((err) => {
      console.error(err);
    });
  }, []);

  const handleDrop = (item, rowIndex, colIndex) => {
    const newLayout = [...gridLayout];
    newLayout[rowIndex][colIndex] = { name: item.name };
    setGridLayout(newLayout);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex max-w-full">
        <div className="mt-14 mr-4 flex flex-col">
          <DraggableNavItem name="Pull Requests" />
          <DraggableNavItem name="Code Contributions" />
          <DraggableNavItem name="Issue Tracking" />
        </div>
        <div className="mt-4 flex flex-col items-center">
          <p className="mt-10 text-5xl">Info for {repo}</p>
          <GridDropZone onDrop={handleDrop} gridLayout={gridLayout} />
        </div>
      </div>
    </DndProvider>
  );
}
