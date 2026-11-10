import { useEffect, useState } from 'react';
import { btn, useDialog } from './ui';

function LocationForm({ location, onCancel, onSave }) {
  const [name, setName] = useState(location?.name || '');
  const [address, setAddress] = useState(location?.address || '');

  function submit(e) {
    e.preventDefault();
    onSave({ id: location?.id || `location-${Date.now()}`, name: name.trim(), address: address.trim() });
  }

  return (
    <form className="location-modal__form" onSubmit={submit}>
      <label>
        Location name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home" required />
      </label>
      <label>
        Address or landmark
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Mars St, Golden Country Homes" required />
      </label>
      <div className="location-modal__actions">
        <button type="button" className={btn('outlineDark')} onClick={onCancel}>Cancel</button>
        <button type="submit" className={btn('navy')}>{location ? 'Update Location' : 'Add Location'}</button>
      </div>
    </form>
  );
}

export default function LocationModal({ open, locations, onChange, onClose }) {
  const [editing, setEditing] = useState(null);
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  useEffect(() => {
    if (!open) setEditing(null);
  }, [open]);

  function saveLocation(location) {
    onChange(editing && editing !== 'new'
      ? locations.map((item) => item.id === location.id ? location : item)
      : [...locations, location]);
    setEditing(null);
  }

  function deleteLocation(id) {
    onChange(locations.filter((location) => location.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="locationTitle"
      className="location-modal"
    >
      <header className="location-modal__header">
        <div>
          <h2 id="locationTitle">Saved Locations</h2>
          <p>Manage the places where you want to receive safety updates.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="location-modal__close">&times;</button>
      </header>

      <div className="location-modal__body">
        {editing ? (
          <LocationForm location={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSave={saveLocation} />
        ) : (
          <>
            <div className="location-modal__list">
              {locations.length ? locations.map((location) => (
                <article className="location-modal__item" key={location.id}>
                  <div><strong>{location.name}</strong><span>{location.address}</span></div>
                  <div className="location-modal__item-actions">
                    <button type="button" className="location-modal__text-button" onClick={() => setEditing(location)}>Edit</button>
                    <button type="button" className="location-modal__text-button location-modal__text-button--danger" onClick={() => deleteLocation(location.id)}>Delete</button>
                  </div>
                </article>
              )) : <p className="location-modal__empty">No saved locations yet. Add one to get started.</p>}
            </div>
            <button type="button" className={btn('navy', 'location-modal__add')} onClick={() => setEditing('new')}>Add Location</button>
          </>
        )}
      </div>

      {!editing && <footer className="location-modal__footer"><button type="button" className={btn('outlineDark')} onClick={onClose}>Done</button></footer>}
    </dialog>
  );
}
