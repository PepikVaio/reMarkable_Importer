#!/bin/bash

# | Popis!
# | Tento skript vyhledá ve složce *pdf soubor dle ID nebo poslední změny.
# 
# * Vyhledává nejnovější soubory a složky na základě zadaných kritérií.
# * Stahuje je do domovského adresáře reMarkable.

# | Použití!
# | Skript lze spustit bez parametrů.

# * Pokud je zadané ID souboru v reMarkable, bude hledat soubor začínající tímto ID a stáhne nejnovější soubor .pdf.
# * Jinak hledá nejnovější soubor s příponou .pdf.
# * echo je ve scriptu rozdělené na několik částí (info, error, variables).
#   ** info - slouží jako informace
#   ** error - chyba ve scriptu (script se ukončí)
#   ** variables - pro použití v apple zkratkách (jako proměnné)

# | Konfigurace!
# | Najdete v reMarkable.

# * reMarkable_File_ID: ID souboru (nepovinné).
# * reMarkable_Path: Cesta k adresáři souborů.
# ************************************************************************************************

# ID souboru, například eaf3f838 (nepovinný)
#reMarkable_File_ID=""
reMarkable_File_ID="${1:-}"

# Cesta k souborům
reMarkable_Path="/home/root/.local/share/remarkable/xochitl/"

WGET="wget"

# Funkce pro nalezení nejnovějšího souboru s příponou .pdf
find_Latest_PDF_File() {
    local search_path="$1"
    local search_pattern="$2"
    find "$search_path" -type f -name "$search_pattern" -print | while read -r file; do
        echo "$(stat -c '%Y' "$file") $file"
    done | sort -n | tail -1 | awk '{print $2}'
}

# Funkce pro zpracování nalezeného souboru
process_Latest_File() {

	local latest_file="$1"
  local latest_directory="$2"

  # Ověření, zda byl nalezen soubor
	if [ -n "$latest_file" ]; then

		# Získání názvu souboru bez cesty
    file_name=$(basename "$latest_file")

    # Získání názvu souboru bez přípony
    file_name_no_ext="${file_name%.*}"
    echo "Info: Nejnověji upravený soubor: $file_name"
    echo "Info: Nejnověji upravený soubor bez koncovky: $file_name_no_ext"

    # Volání funkce pro stažení souboru (s parametry)
    #download_File "$latest_file" "$file_name_no_ext"
				
		# Celková cesta k souboru
		echo "Info: Cestak k souboru: $latest_file"

		# Nastavení environmentální proměnné do insert_Element.js souboru
		# export FILE_PATH="$latest_file"
		
		# Aktualizace load_Data.json souboru
		#sed -i 's#"file_Path": ""#"file_Path": "'$latest_file'"#' load_Data.json
		#echo "Hodnota byla přidána do file_Path v load_Data.json"
		
		sed -i 's#"file_Path": "[^"]*"#"file_Path": "'$latest_file'"#' load_Data.json
		echo "Hodnota byla nahrazena v file_Path v load_Data.json"


		# Zastaví skript při jakékoliv chybě
		set -e  # Zastaví skript při jakékoliv chybě

		# Nastavení cesty k Node.js
		export PATH=$PATH:/home/root/.local/share/node-v22.12.0-linux-armv7l/bin
		# Přechod do správného adresáře a spuštění JS skriptu
		cd /home/root/.local/share/@Wajsar_Josef/insert_Element
		node insert_Element.js

	else
  	echo "Error: Ve složce '$latest_directory' nejsou žádné soubory."
    exit 1
		fi
}

# Funkce pro stažení souboru
download_File() {
    upgrade_WGET

    local file_path="$1"
    local file_name="$2"

    # Vrátí název souboru jako výstup pro další použití v Apple Shortcuts
    echo "Variables: $file_name_no_ext"
    # Kopírování souboru do aktuální složky
    cp "$file_path" .
}

# Funkce pro opravu wget
upgrade_WGET () {
    wget_path=/home/root/.local/share/wget/wget
    wget_remote=http://toltec-dev.org/thirdparty/bin/wget-v1.21.1-1
    wget_checksum=c258140f059d16d24503c62c1fdf747ca843fe4ba8fcd464a6e6bda8c3bbb6b5

    # Tato část skriptu kontroluje, zda je soubor wget na specifikované cestě ($wget_path) a zda má správný kontrolní součet.
    # Pokud kontrolní součet nesouhlasí, soubor se smaže.
    if [ -f "$wget_path" ] && ! sha256sum -c <(echo "$wget_checksum  $wget_path") > /dev/null 2>&1; then
        rm "$wget_path"
    fi

    # Tato část skriptu kontroluje, zda je soubor wget na specifikované cestě ($wget_path).
    # Pokud ne, soubor se stáhne.
    if ! [ -f "$wget_path" ]; then
        echo "Info: Načítání zabezpečeného wget"
        # Stáhněte si a porovnejte s hash
        mkdir -p "$(dirname "$wget_path")"
        if ! wget -cq "$wget_remote" --output-document "$wget_path"; then
            echo "Error: Nelze načíst wget, ujistěte se, že máte stabilní připojení Wi-Fi"
            exit 1
        fi
    fi

    # Tento úsek skriptu kontroluje integritu staženého souboru wget pomocí jeho SHA-256 kontrolního součtu.
    if ! sha256sum -c <(echo "$wget_checksum  $wget_path") > /dev/null 2>&1; then
        echo "Error: Neplatný kontrolní součet pro místní binární soubor wget"
        exit 1
    fi

    chmod 755 "$wget_path"
    WGET="$wget_path"
}

# Hlavní část skriptu
if [ -n "$reMarkable_File_ID" ]; then
    # Pokud je reMarkable_File_ID neprázdný, najdi soubor začínající na ID a s příponou .pdf
    latest_file=$(find_Latest_PDF_File "$reMarkable_Path" "${reMarkable_File_ID}*.pdf")

    if [ -n "$latest_file" ]; then
        # Volání funkce pro zpracování nalezeného souboru
        process_Latest_File "$latest_file" "$reMarkable_Path"
    else
        echo "Error: Soubor začínající na '$reMarkable_File_ID' s příponou .pdf nebyl nalezen."
        exit 1
    fi
else
    # Pokud není reMarkable_File_ID zadáno, najdi poslední upravený soubor s příponou .pdf
    latest_file=$(find_Latest_PDF_File "$reMarkable_Path" "*.pdf")

    if [ -n "$latest_file" ]; then
        # Volání funkce pro zpracování nalezeného souboru
        process_Latest_File "$latest_file" "$reMarkable_Path"
    else
        echo "Error: Nebyl nalezen žádný soubor s příponou .pdf."
        exit 1
    fi
fi
