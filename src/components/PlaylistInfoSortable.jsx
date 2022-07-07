import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import PlaylistInfo from "./PlaylistInfo";
import { CSS } from "@dnd-kit/utilities";

const PlaylistInfoSortable = ({ ...props }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
            id: props.id
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <PlaylistInfo
            setRef={setNodeRef}
            style={style}
            {...props}
            {...listeners}
        />
    );
};

export default PlaylistInfoSortable;
