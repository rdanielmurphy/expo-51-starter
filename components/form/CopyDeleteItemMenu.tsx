import React, { useCallback, useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { EditItemNameModal } from '../modals/EditItemNameModal';
import { COMMENT } from '../../lib/types';
import { EditCommentGroupModal } from '../modals/EditCommentGroupModal';

interface IProps {
    name: string
    type: string
    groupId?: number
    onCopy: () => void
    onDelete: () => void
    onEditName: (newName: string) => void
    onEditOptions?: () => void
    onEditCommentGroupName?: (commentGroupId: number) => void
    onEditCommentGroupComments?: (commentGroupId: number, commentGroupName?: string) => void
}

const EditItemMenu = (props: IProps) => {
    const [visible, setVisible] = useState(false);
    const [showEditNameModal, setShowEditNameModal] = useState(false);
    const [showEditCommentGroupModal, setShowEditCommentGroupModal] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleEditCommentGroupComments = useCallback((commentGroupId: number, commentGroupName?: string) => {
        closeMenu();
        if (props.onEditCommentGroupComments) {
            props.onEditCommentGroupComments(commentGroupId, commentGroupName);
        }
    }, [closeMenu, props.onEditCommentGroupComments]);

    return (
        <>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={<IconButton
                    style={{ width: 50 }}
                    icon="menu-down"
                    onPress={() => openMenu()}
                />}>
                <Menu.Item disabled onPress={() => { }} title={props.type + " Menu"} />
                <Menu.Item onPress={() => {
                    setShowEditNameModal(true)
                    closeMenu()
                }} title="Edit Name" />
                {props.type === COMMENT && (
                    <Menu.Item onPress={() => {
                        handleEditCommentGroupComments(props.groupId || 0, undefined)
                        closeMenu()
                    }} title="Edit Comments" />
                )}
                {props.type === COMMENT && (
                    <Menu.Item onPress={() => {
                        setShowEditCommentGroupModal(true)
                        closeMenu()
                    }} title="Edit Comment Group" />
                )}
                {props.onEditOptions && <Menu.Item onPress={() => {
                    if (props.onEditOptions) {
                        props.onEditOptions();
                    }
                    closeMenu()
                }} title="Edit Options" />}
                <Menu.Item onPress={() => {
                    props.onCopy()
                    closeMenu()
                }} title="Copy" />
                <Menu.Item onPress={() => {
                    props.onDelete()
                    closeMenu()
                }} title="Delete" />
            </Menu>
            {showEditNameModal && <EditItemNameModal
                type={props.type}
                name={props.name}
                onClose={() => {
                    setShowEditNameModal(false)
                }}
                onSubmit={(newName: string) => {
                    props.onEditName(newName)
                    setShowEditNameModal(false)
                }}
            />}
            {showEditCommentGroupModal && <EditCommentGroupModal
                currentGroupId={props.groupId}
                onEditComments={handleEditCommentGroupComments}
                onClose={() => {
                    setShowEditCommentGroupModal(false);
                }}
                onSubmit={(commentGroupId: number) => {
                    props.onEditCommentGroupName && props.onEditCommentGroupName(commentGroupId);
                    setShowEditCommentGroupModal(false);
                }}
            />}
        </>
    );
};

export default EditItemMenu;