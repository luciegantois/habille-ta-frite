import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

import frite from "./assets/corps/frite.png";

const chapeaux = Object.values(
  import.meta.glob("./assets/chapeaux/*.png", {
    eager: true,
    import: "default",
  })
);

const tenues = Object.values(
  import.meta.glob("./assets/tenues/*.png", {
    eager: true,
    import: "default",
  })
);

const accessoires = Object.values(
  import.meta.glob("./assets/accessoires/*.png", {
    eager: true,
    import: "default",
  })
);

function App() {
  const [menuActif, setMenuActif] = useState("chapeaux");
  const [objetsAjoutes, setObjetsAjoutes] = useState([]);
  const [objetSelectionne, setObjetSelectionne] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const [decor, setDecor] = useState(null);
  const [friteSelectionnee, setFriteSelectionnee] = useState(false);

  const [positionFrite, setPositionFrite] = useState({
    x: 25,
    y: 60,
    width: 250,
    height: 300,
    rotation: 0,
  });

  const zoneRef = useRef(null);

  const menus = {
    chapeaux,
    tenues,
    accessoires,
  };

  useEffect(() => {
    [...chapeaux, ...tenues, ...accessoires, frite].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  function ajouterObjet(image) {
    setObjetsAjoutes((anciens) => [
      ...anciens,
      {
        id: Date.now() + Math.random(),
        image,
        x: 110,
        y: 130,
        width: 70,
        height: 70,
        rotation: 0,
      },
    ]);
  }

  function supprimerObjet(id) {
    setObjetsAjoutes((anciens) =>
      anciens.filter((objet) => objet.id !== id)
    );
    setObjetSelectionne(null);
  }

  function tournerObjet(id) {
    setObjetsAjoutes((anciens) =>
      anciens.map((objet) =>
        objet.id === id
          ? { ...objet, rotation: objet.rotation + 15 }
          : objet
      )
    );
  }

  function tournerFrite() {
    setPositionFrite((p) => ({
      ...p,
      rotation: p.rotation + 15,
    }));
  }

  async function enregistrerImage(e) {
    e.stopPropagation();

    try {
      setObjetSelectionne(null);
      setFriteSelectionnee(false);
      setEnregistrement(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!zoneRef.current) {
        alert("Zone introuvable");
        return;
      }

      const canvas = await html2canvas(zoneRef.current, {
        backgroundColor: "#fff7d6",
        scale: 3,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Erreur pendant la création de l'image");
          return;
        }

        const url = URL.createObjectURL(blob);
        const lien = document.createElement("a");

        lien.href = url;
        lien.download = "ma-frite.png";
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);

        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error(error);
      alert("Impossible d'enregistrer l'image. Regarde la console.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div
      style={{ textAlign: "center", fontFamily: "Arial" }}
      onMouseDown={() => {
        setObjetSelectionne(null);
        setFriteSelectionnee(false);
      }}
      onTouchStart={() => {
        setObjetSelectionne(null);
        setFriteSelectionnee(false);
      }}
    >
      <h1>Habille ta frite 🍟</h1>

      <label
        style={{
          display: "inline-block",
          padding: "10px 15px",
          background: "#4caf50",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        📸 Prendre une photo du décor

        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => {
            const fichier = e.target.files?.[0];

            if (fichier) {
              setDecor(URL.createObjectURL(fichier));
            }
          }}
        />
      </label>

      <div
        ref={zoneRef}
        style={{
          position: "relative",
          width: "300px",
          height: "400px",
          margin: "auto",
          border: "2px solid #ddd",
          overflow: "hidden",
          backgroundImage: decor ? `url(${decor})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#fff7d6",
        }}
      >
        <Rnd
          size={{
            width: positionFrite.width,
            height: positionFrite.height,
          }}
          position={{
            x: positionFrite.x,
            y: positionFrite.y,
          }}
          bounds="parent"
          cancel=".bouton-controle"
          enableResizing={
            friteSelectionnee && !enregistrement
              ? {
                  top: false,
                  right: true,
                  bottom: true,
                  left: false,
                  topRight: true,
                  bottomRight: true,
                  bottomLeft: false,
                  topLeft: false,
                }
              : false
          }
          resizeHandleStyles={{
            bottomRight: {
              width: friteSelectionnee && !enregistrement ? "24px" : "0px",
              height: friteSelectionnee && !enregistrement ? "24px" : "0px",
              background:
                friteSelectionnee && !enregistrement
                  ? "#2196f3"
                  : "transparent",
              borderRadius: "50%",
              display:
                friteSelectionnee && !enregistrement ? "block" : "none",
            },
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setFriteSelectionnee(true);
            setObjetSelectionne(null);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setFriteSelectionnee(true);
            setObjetSelectionne(null);
          }}
          onDragStop={(e, d) => {
            setPositionFrite((p) => ({
              ...p,
              x: d.x,
              y: d.y,
            }));
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setPositionFrite((p) => ({
              ...p,
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            }));
          }}
          style={{
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transform: `rotate(${positionFrite.rotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={frite}
              alt="Frite"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />

            {friteSelectionnee && !enregistrement && (
              <button
                className="bouton-controle"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  tournerFrite();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  tournerFrite();
                }}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  left: "5px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "none",
                  background: "white",
                  cursor: "pointer",
                  zIndex: 999,
                }}
              >
                🔄
              </button>
            )}
          </div>
        </Rnd>

        {objetsAjoutes.map((objet) => (
          <Rnd
            key={objet.id}
            default={{
              x: objet.x,
              y: objet.y,
              width: objet.width,
              height: objet.height,
            }}
            bounds="parent"
            cancel=".bouton-controle"
            enableResizing={
              objetSelectionne === objet.id && !enregistrement
                ? {
                    top: false,
                    right: true,
                    bottom: true,
                    left: false,
                    topRight: true,
                    bottomRight: true,
                    bottomLeft: false,
                    topLeft: false,
                  }
                : false
            }
            resizeHandleStyles={{
              bottomRight: {
                width:
                  objetSelectionne === objet.id && !enregistrement
                    ? "24px"
                    : "0px",
                height:
                  objetSelectionne === objet.id && !enregistrement
                    ? "24px"
                    : "0px",
                background:
                  objetSelectionne === objet.id && !enregistrement
                    ? "#2196f3"
                    : "transparent",
                borderRadius: "50%",
                display:
                  objetSelectionne === objet.id && !enregistrement
                    ? "block"
                    : "none",
              },
            }}
            style={{
              zIndex: 5,
            }}
          >
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setFriteSelectionnee(false);
                setObjetSelectionne(objet.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setFriteSelectionnee(false);
                setObjetSelectionne(objet.id);
              }}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
              }}
            >
              <img
                src={objet.image}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `rotate(${objet.rotation}deg)`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              {objetSelectionne === objet.id && !enregistrement && (
                <>
                  <button
                    className="bouton-controle"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      supprimerObjet(objet.id);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      supprimerObjet(objet.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      zIndex: 999,
                    }}
                  >
                    ❌
                  </button>

                  <button
                    className="bouton-controle"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      tournerObjet(objet.id);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      tournerObjet(objet.id);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      left: "5px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      zIndex: 999,
                    }}
                  >
                    🔄
                  </button>
                </>
              )}
            </div>
          </Rnd>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuActif("chapeaux");
          }}
        >
          Chapeaux
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuActif("tenues");
          }}
        >
          Tenues
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuActif("accessoires");
          }}
        >
          Accessoires
        </button>
      </div>

      <button
        onClick={enregistrerImage}
        style={{
          marginTop: "15px",
          padding: "10px 18px",
          cursor: "pointer",
          borderRadius: "8px",
          border: "none",
          background: "#2196f3",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Enregistrer l’image
      </button>

      <h2>{menuActif}</h2>

      <div>
        {menus[menuActif].map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            width="70"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              ajouterObjet(image);
            }}
            style={{
              margin: "5px",
              cursor: "pointer",
              border: "1px solid #ccc",
              padding: "5px",
              background: "white",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;