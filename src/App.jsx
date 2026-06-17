import { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";

import frite from "./assets/corps/frite.png";
import logoJDL from "./assets/logo/LOGO_JDL.png";

const tete = Object.values(
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
  const [menuActif, setMenuActif] = useState("tete");
  const [objetsAjoutes, setObjetsAjoutes] = useState([]);
  const [objetSelectionne, setObjetSelectionne] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [decor, setDecor] = useState(null);
  const [friteSelectionnee, setFriteSelectionnee] = useState(false);

  const [positionFrite, setPositionFrite] = useState({
    x: 75,
    y: 100,
    width: 150,
    height: 180,
    rotation: 0,
  });

  const zoneRef = useRef(null);

  const menus = {
    tete,
    tenues,
    accessoires,
  };

  useEffect(() => {
    [...tete, ...tenues, ...accessoires, frite].forEach((src) => {
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
    setObjetsAjoutes((anciens) => anciens.filter((objet) => objet.id !== id));
    setObjetSelectionne(null);
  }

  function getPoint(e) {
    if (e.touches && e.touches[0]) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      };
    }

    return {
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }

  function tournerFriteAuDoigt(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!zoneRef.current) return;

    const { clientX, clientY } = getPoint(e);
    const rect = zoneRef.current.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centreX = positionFrite.x + positionFrite.width / 2;
    const centreY = positionFrite.y + positionFrite.height / 2;

    const angle = Math.atan2(y - centreY, x - centreX) * (180 / Math.PI);

    setPositionFrite((p) => ({
      ...p,
      rotation: angle + 90,
    }));
  }

  function tournerObjetAuDoigt(e, objet) {
    e.preventDefault();
    e.stopPropagation();

    if (!zoneRef.current) return;

    const { clientX, clientY } = getPoint(e);
    const rect = zoneRef.current.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centreX = objet.x + objet.width / 2;
    const centreY = objet.y + objet.height / 2;

    const angle = Math.atan2(y - centreY, x - centreX) * (180 / Math.PI);

    setObjetsAjoutes((anciens) =>
      anciens.map((o) =>
        o.id === objet.id ? { ...o, rotation: angle + 90 } : o
      )
    );
  }

  function agrandirFrite() {
    setPositionFrite((p) => ({
      ...p,
      width: p.width + 20,
      height: p.height + 24,
    }));
  }

  function reduireFrite() {
    setPositionFrite((p) => ({
      ...p,
      width: Math.max(60, p.width - 20),
      height: Math.max(80, p.height - 24),
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

      const lien = document.createElement("a");
      lien.download = "ma-frite.png";
      lien.href = canvas.toDataURL("image/png", 1.0);
      lien.click();

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

  const boutonMenu = (nom, label, emoji) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMenuActif(nom);
      }}
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        background: menuActif === nom ? "#ffb703" : "white",
        color: menuActif === nom ? "#222" : "#555",
        boxShadow:
          menuActif === nom
            ? "0 4px 10px rgba(0,0,0,0.2)"
            : "0 2px 6px rgba(0,0,0,0.12)",
      }}
    >
      {emoji} {label}
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "Arial",
        background: "linear-gradient(180deg, #fff3c4, #ffe1ec)",
        padding: "20px",
      }}
      onMouseDown={() => {
        setObjetSelectionne(null);
        setFriteSelectionnee(false);
      }}
      onTouchStart={() => {
        setObjetSelectionne(null);
        setFriteSelectionnee(false);
      }}
    >
      <h1 style={{ margin: "0 0 15px", color: "#d35400" }}>
        Habille ta frite 🍟
      </h1>

      <label
        style={{
          display: "inline-block",
          padding: "12px 18px",
          background: "#4caf50",
          color: "white",
          borderRadius: "999px",
          cursor: "pointer",
          margin: "5px",
          fontWeight: "bold",
        }}
      >
        Prendre une photo

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
      <label
        style={{
          display: "inline-block",
          padding: "12px 18px",
          background: "#2196f3",
          color: "white",
          borderRadius: "999px",
          cursor: "pointer",
          margin: "5px",
          fontWeight: "bold",
        }}
      >
        Choisir une image

        <input
          type="file"
          accept="image/*"
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
          border: "4px solid white",
          borderRadius: "22px",
          overflow: "hidden",
          backgroundImage: decor ? `url(${decor})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#fff7d6",
          boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
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
          enableResizing={false}
          cancel=".bouton-controle"
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
          style={{ zIndex: 2 }}
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                transform: `rotate(${positionFrite.rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${frite})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "contain",
                }}
              />
            </div>

            {friteSelectionnee && !enregistrement && (
              <>
                <button
                  className="bouton-controle"
                  onMouseDown={tournerFriteAuDoigt}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) tournerFriteAuDoigt(e);
                  }}
                  onTouchStart={tournerFriteAuDoigt}
                  onTouchMove={tournerFriteAuDoigt}
                  style={{
                    position: "absolute",
                    bottom: "-18px",
                    left: "30px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "white",
                    cursor: "grab",
                    zIndex: 1001,
                    touchAction: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  🔄
                </button>

                <button
                  className="bouton-controle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    agrandirFrite();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    agrandirFrite();
                  }}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "white",
                    cursor: "pointer",
                    zIndex: 1001,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  ➕
                </button>

                <button
                  className="bouton-controle"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    reduireFrite();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    reduireFrite();
                  }}
                  style={{
                    position: "absolute",
                    bottom: "50px",
                    right: "8px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "none",
                    background: "white",
                    cursor: "pointer",
                    zIndex: 1001,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  ➖
                </button>
              </>
            )}
          </div>
        </Rnd>

        <img
          src={logoJDL}
          alt="Logo JDL"
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            width: "60px",
            zIndex: 50,
            pointerEvents: "none",
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
                border:
                  objetSelectionne === objet.id && !enregistrement
                    ? "3px solid white"
                    : "none",
                display:
                  objetSelectionne === objet.id && !enregistrement
                    ? "block"
                    : "none",
                zIndex: 9999,
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
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${objet.image})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "contain",
                  transform: `rotate(${objet.rotation}deg)`,
                  transformOrigin: "center center",
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
                      top: "-18px",
                      right: "-18px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      zIndex: 1001,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                  >
                    ❌
                  </button>

                  <button
                    className="bouton-controle"
                    onMouseDown={(e) => tournerObjetAuDoigt(e, objet)}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) tournerObjetAuDoigt(e, objet);
                    }}
                    onTouchStart={(e) => tournerObjetAuDoigt(e, objet)}
                    onTouchMove={(e) => tournerObjetAuDoigt(e, objet)}
                    style={{
                      position: "absolute",
                      bottom: "-18px",
                      left: "-18px",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "none",
                      background: "white",
                      cursor: "grab",
                      zIndex: 1001,
                      touchAction: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
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

      <div
        style={{
          margin: "18px auto 12px",
          maxWidth: "360px",
          padding: "12px",
          background: "rgba(255,255,255,0.75)",
          borderRadius: "22px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {boutonMenu("tete", "Tête")}
          {boutonMenu("tenues", "Tenues")}
          {boutonMenu("accessoires", "Accessoires")}
        </div>
      </div>

      <button
        onClick={enregistrerImage}
        style={{
          marginTop: "8px",
          padding: "12px 20px",
          cursor: "pointer",
          borderRadius: "999px",
          border: "none",
          background: "#2196f3",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        Enregistrer l’image
      </button>

      <h2 style={{ color: "#d35400", textTransform: "capitalize" }}>
        {menuActif}
      </h2>

      <div
        style={{
          maxWidth: "380px",
          margin: "auto",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.75)",
          padding: "12px",
          borderRadius: "22px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        }}
      >
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
              cursor: "pointer",
              border: "3px solid white",
              padding: "6px",
              background: "#fff7d6",
              borderRadius: "18px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;