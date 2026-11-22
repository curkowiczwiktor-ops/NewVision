NEWVISION VOTING — INSTRUKCJA

1. Rozpakuj folder.
2. Otwórz folder NewVision-Voting w VS Code (File → Open Folder).
3. Otwórz rozszerzenia VS Code i zainstaluj Live Server, jeśli go nie masz.
4. Kliknij prawym przyciskiem index.html → Open with Live Server.
5. W Firebase Console → Authentication → Sign-in method włącz Anonymous.

WAŻNE:
- Projekt korzysta z konfiguracji Firebase podanej w rozmowie.
- Jeśli strona pokaże błąd PERMISSION_DENIED, reguły Realtime Database blokują odczyt/zapis.
- Nie ustawiaj publicznie .read i .write na true.
- Ten folder jest wersją demonstracyjną. Nie używaj go do prawdziwego, publicznego głosowania: głosy i liczniki po stronie przeglądarki nie są odporne na manipulacje, a wyniki nie mają zabezpieczonego panelu administratora. Do publicznego głosowania potrzebny jest backend (np. Cloud Functions) z kontrolą uprawnień.
