// manages modals on the page - should be limited to new log entries and date/time inputs, but should provide flexibility for more

var activeModals = []; //empty list for holding modals (use push/pop to addremove from end)

function addModal(m, closeOtherModals) {
    event && event.stopPropagation(); //prevent this modal creation event from triggering other actions
    //close other modals as requested
    if (closeOtherModals) {
        while (activeModals.length > 0) {
            closeTopModal();
        }
    }

    if (activeModals.length === 0) {
        //first modal added to list, add event listeners
        document.addEventListener('click', modalEscapeHandler);
        document.addEventListener('keydown', modalEscapeHandler);
    }
    //add modal to the end of the list
    activeModals.push(m);
}

function closeTopModal() {
    if (activeModals.length > 0) {
        let topModal = activeModals.pop(); //get the last modal off the stack
        topModal.close(); //give modal opportunity to clean up after itself
        //topModal.modal.outerHTML = ''; //erase from page (this will not cleanly cancel input, so this must be completed in close function)
    }
    //if there are no modals remaining, remove listeners from page
    if (activeModals.length === 0) {
        document.removeEventListener('click', modalEscapeHandler);
        document.removeEventListener('keydown', modalEscapeHandler);
    }
}

//allows removal of a specific modal from the active list (if it exists)
//this will not call the close method
//best used when modal closes itself and has already cleaned up or a parent is managing modals and doesn't want to use the usual (close top) method becuase there may be other modals in the list that are already open over our target
function removeSpecificModal(tgtModal) {
    let tgtIndex = activeModals.indexOf(tgtModal);
    if (tgtIndex >= 0) {
        activeModals.splice(tgtIndex, 1);
    }
    //if there are no modals remaining, remove listeners from page
    if (activeModals.length === 0) {
        document.removeEventListener('click', modalEscapeHandler);
        document.removeEventListener('keydown', modalEscapeHandler);
    }
}

//listens for Escape keypress or clicks outside modal
function modalEscapeHandler() {
    //any clicks that have bubbled up to page level must be outside a modal
    //or this was called by a modal exit button
    if (event.type === 'click') {
        closeTopModal();
    } else if (event.key === "Escape" || event.key === "Esc") {
        //any escape that bubbles up should close the top modal
        console.log("Escape key pressed");
        closeTopModal();
    }
}