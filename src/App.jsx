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

  async function enregistrerImage(e) {
    e.stopPropagation();

    try {
      setObjetSelectionne(null);
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
      onMouseDown={() => setObjetSelectionne(null)}
      onTouchStart={() => setObjetSelectionne(null)}    >
      <h1>Habille ta frite 🍟</h1>

      <div
        ref={zoneRef}
        style={{
          position: "relative",
          width: "300px",
          height: "400px",
          margin: "auto",
          border: "2px solid #ddd",
          overflow: "hidden",
          background: "#fff7d6",
        }}
      >
        <img
          src={frite}
          alt="Frite"
          style={{
            width: "250px",
            marginTop: "60px",
          }}
        />

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
                    ? "20px"
                    : "0px",
                height:
                  objetSelectionne === objet.id && !enregistrement
                    ? "20px"
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
          >
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setObjetSelectionne(objet.id);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setObjetSelectionne(objet.id);
              }}
            >
              <img
                src={objet.image}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: `rotate(${objet.rotation}deg)`,
                }}
              />

              {objetSelectionne === objet.id && !enregistrement && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      supprimerObjet(objet.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-10px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    ❌
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tournerObjet(objet.id);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "-35px",
                      left: "-10px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      zIndex: 10,
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